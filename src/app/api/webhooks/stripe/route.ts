import { type NextRequest, NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { env } from '@/lib/env';
import { createServiceRoleClient } from '@/lib/supabase/server';
import type { OrgPlan, SubscriptionStatus } from '@/types/domain';

// Stripe sends raw body — Next.js must not parse it
export const dynamic = 'force-dynamic';

function mapStripePlanToPlan(priceId: string): OrgPlan {
  if (priceId === env.STRIPE_PRICE_SOLO) return 'solo';
  if (priceId === env.STRIPE_PRICE_TEAM) return 'team';
  if (priceId === env.STRIPE_PRICE_AGENCY) return 'agency';
  return 'solo';
}

function mapStripeStatus(status: string): SubscriptionStatus {
  const valid: SubscriptionStatus[] = [
    'active',
    'past_due',
    'canceled',
    'trialing',
    'incomplete',
  ];
  if (valid.includes(status as SubscriptionStatus)) {
    return status as SubscriptionStatus;
  }
  return 'incomplete';
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[Stripe Webhook] Signature verification failed:', message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const supabase = await createServiceRoleClient();

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const orgId = session.metadata?.['orgId'];
        if (!orgId || !session.customer) break;

        const customerId =
          typeof session.customer === 'string'
            ? session.customer
            : session.customer.id;

        const plan = (session.metadata?.['plan'] as OrgPlan | undefined) ?? 'solo';

        await supabase.from('subscriptions').upsert(
          {
            org_id: orgId,
            stripe_customer_id: customerId,
            stripe_subscription_id:
              typeof session.subscription === 'string'
                ? session.subscription
                : (session.subscription?.id ?? null),
            plan,
            status: 'active',
          },
          { onConflict: 'org_id' },
        );

        await supabase
          .from('organizations')
          .update({ plan })
          .eq('id', orgId);

        break;
      }

      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription;
        const customerId =
          typeof sub.customer === 'string' ? sub.customer : sub.customer.id;

        const firstItem = sub.items.data[0];
        const priceId = firstItem?.price.id ?? '';
        const plan = mapStripePlanToPlan(priceId);
        const status = mapStripeStatus(sub.status);

        const { data: subscription } = await supabase
          .from('subscriptions')
          .update({
            stripe_subscription_id: sub.id,
            plan,
            status,
            current_period_end: new Date(
              sub.current_period_end * 1000,
            ).toISOString(),
            cancel_at_period_end: sub.cancel_at_period_end,
          })
          .eq('stripe_customer_id', customerId)
          .select('org_id')
          .single();

        if (subscription?.org_id) {
          await supabase
            .from('organizations')
            .update({ plan })
            .eq('id', subscription.org_id as string);
        }

        break;
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        const customerId =
          typeof sub.customer === 'string' ? sub.customer : sub.customer.id;

        const { data: subscription } = await supabase
          .from('subscriptions')
          .update({ status: 'canceled' })
          .eq('stripe_customer_id', customerId)
          .select('org_id')
          .single();

        if (subscription?.org_id) {
          await supabase
            .from('organizations')
            .update({ plan: 'solo' })
            .eq('id', subscription.org_id as string);
        }

        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId =
          typeof invoice.customer === 'string'
            ? invoice.customer
            : invoice.customer?.id;
        if (!customerId) break;

        await supabase
          .from('subscriptions')
          .update({ status: 'past_due' })
          .eq('stripe_customer_id', customerId);

        break;
      }

      case 'payment_intent.succeeded': {
        const pi = event.data.object as Stripe.PaymentIntent;
        const proposalId = pi.metadata?.['proposalId'];
        if (!proposalId) break;

        await supabase
          .from('proposals')
          .update({
            outcome: 'won',
            status: 'won',
            stripe_payment_id: pi.id,
          })
          .eq('id', proposalId);

        break;
      }

      default:
        // Unhandled event type — ACK and ignore
        break;
    }
  } catch (err) {
    console.error('[Stripe Webhook] Handler error:', err);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 },
    );
  }

  return NextResponse.json({ received: true });
}

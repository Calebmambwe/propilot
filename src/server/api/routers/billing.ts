import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { createTRPCRouter, protectedProcedure } from '@/server/trpc';
import { stripe } from '@/lib/stripe';
import { env } from '@/lib/env';
import type { OrgPlan } from '@/types/domain';

const PLAN_PRICE_IDS: Record<OrgPlan, string> = {
  solo: env.STRIPE_PRICE_SOLO,
  team: env.STRIPE_PRICE_TEAM,
  agency: env.STRIPE_PRICE_AGENCY,
};

export const billingRouter = createTRPCRouter({
  createCheckoutSession: protectedProcedure
    .input(
      z.object({
        orgId: z.string().uuid(),
        plan: z.enum(['solo', 'team', 'agency']),
        successUrl: z.string().url(),
        cancelUrl: z.string().url(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { data: user } = await ctx.supabase
        .from('users')
        .select('email, full_name')
        .eq('id', ctx.user.id)
        .single();

      // Check for existing subscription/customer
      const { data: subscription } = await ctx.supabase
        .from('subscriptions')
        .select('stripe_customer_id')
        .eq('org_id', input.orgId)
        .single();

      const priceId = PLAN_PRICE_IDS[input.plan];

      const session = await stripe.checkout.sessions.create({
        customer: subscription?.stripe_customer_id ?? undefined,
        customer_email: subscription?.stripe_customer_id
          ? undefined
          : (user?.email ?? undefined),
        mode: 'subscription',
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        metadata: {
          orgId: input.orgId,
          userId: ctx.user.id,
          plan: input.plan,
        },
        success_url: input.successUrl,
        cancel_url: input.cancelUrl,
        allow_promotion_codes: true,
      });

      if (!session.url) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create checkout session',
        });
      }

      return { url: session.url };
    }),

  createPortalSession: protectedProcedure
    .input(
      z.object({
        orgId: z.string().uuid(),
        returnUrl: z.string().url(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { data: subscription } = await ctx.supabase
        .from('subscriptions')
        .select('stripe_customer_id')
        .eq('org_id', input.orgId)
        .single();

      if (!subscription?.stripe_customer_id) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'No billing account found. Please subscribe first.',
        });
      }

      const session = await stripe.billingPortal.sessions.create({
        customer: subscription.stripe_customer_id as string,
        return_url: input.returnUrl,
      });

      return { url: session.url };
    }),

  getSubscription: protectedProcedure
    .input(z.object({ orgId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { data } = await ctx.supabase
        .from('subscriptions')
        .select('id, plan, status, current_period_end, cancel_at_period_end')
        .eq('org_id', input.orgId)
        .single();

      if (!data) {
        return null;
      }

      return {
        id: data.id as string,
        plan: data.plan as OrgPlan,
        status: data.status as string,
        currentPeriodEnd: data.current_period_end as string | null,
        cancelAtPeriodEnd: data.cancel_at_period_end as boolean,
      };
    }),
});

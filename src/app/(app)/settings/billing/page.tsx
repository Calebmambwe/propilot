import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlanCard } from '@/components/billing/plan-card';
import { Badge } from '@/components/ui/badge';
import type { OrgPlan, SubscriptionStatus } from '@/types/domain';

const PLANS: Array<{
  plan: OrgPlan;
  name: string;
  price: number;
  features: string[];
}> = [
  {
    plan: 'solo',
    name: 'Solo',
    price: 49,
    features: [
      '1 user',
      'Unlimited proposals',
      'AI generation (20/hour)',
      'Email tracking',
      'Analytics dashboard',
      '"Powered by ProPilot" footer',
    ],
  },
  {
    plan: 'team',
    name: 'Team',
    price: 99,
    features: [
      'Up to 5 users',
      'Unlimited proposals',
      'AI generation (50/hour)',
      'Email tracking',
      'Analytics dashboard',
      'Remove "Powered by ProPilot" footer',
    ],
  },
  {
    plan: 'agency',
    name: 'Agency',
    price: 199,
    features: [
      'Up to 25 users',
      'Unlimited proposals',
      'AI generation (unlimited)',
      'Email tracking',
      'Full analytics suite',
      'White-label footer',
      'Priority support',
    ],
  },
];

export default async function BillingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: membership } = await supabase
    .from('organization_members')
    .select('org_id')
    .eq('user_id', user!.id)
    .limit(1)
    .single();

  const { data: subscription } = membership
    ? await supabase
        .from('subscriptions')
        .select('plan, status, current_period_end, cancel_at_period_end')
        .eq('org_id', membership.org_id as string)
        .single()
    : { data: null };

  const currentPlan = (subscription?.plan as OrgPlan | undefined) ?? null;
  const subStatus = (subscription?.status as SubscriptionStatus | undefined) ?? null;

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Billing</h1>
        <p className="text-muted-foreground">
          Manage your subscription and billing
        </p>
      </div>

      {subscription && (
        <Card>
          <CardHeader>
            <CardTitle>Current Subscription</CardTitle>
            <CardDescription>
              Your active plan and billing details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-medium capitalize">{currentPlan} plan</span>
              <Badge
                variant={subStatus === 'active' ? 'default' : 'destructive'}
              >
                {subStatus}
              </Badge>
            </div>
            {subscription.current_period_end && (
              <p className="text-sm text-muted-foreground">
                {subscription.cancel_at_period_end
                  ? 'Cancels'
                  : 'Renews'}{' '}
                on{' '}
                {new Date(
                  subscription.current_period_end as string,
                ).toLocaleDateString()}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        {PLANS.map((plan) => (
          <PlanCard
            key={plan.plan}
            plan={plan.plan}
            name={plan.name}
            price={plan.price}
            features={plan.features}
            isCurrentPlan={currentPlan === plan.plan}
            orgId={membership?.org_id as string | undefined}
          />
        ))}
      </div>
    </div>
  );
}

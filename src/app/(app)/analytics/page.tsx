import { Suspense } from 'react';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { StatsCards } from '@/components/analytics/stats-cards';
import { WinRateChart } from '@/components/analytics/win-rate-chart';

async function AnalyticsDashboard({ orgId }: { orgId: string }) {
  const supabase = await createClient();
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const { data: proposals } = await supabase
    .from('proposals')
    .select('id, outcome, deal_value, created_at, sent_at, first_opened_at')
    .eq('org_id', orgId)
    .gte('created_at', thirtyDaysAgo.toISOString());

  const decided = (proposals ?? []).filter(
    (p) => p.outcome === 'won' || p.outcome === 'lost',
  );
  const won = decided.filter((p) => p.outcome === 'won');
  const winRate = decided.length > 0 ? won.length / decided.length : 0;

  const wonValues = won
    .filter((p) => p.deal_value != null)
    .map((p) => p.deal_value as number);
  const avgDealValue =
    wonValues.length > 0
      ? wonValues.reduce((a, b) => a + b, 0) / wonValues.length
      : null;

  // Build win rate trend for chart
  const trendBuckets = new Map<string, { total: number; won: number }>();
  for (const p of decided) {
    const date = new Date(p.created_at as string);
    const key = date.toISOString().split('T')[0] ?? '';
    const existing = trendBuckets.get(key) ?? { total: 0, won: 0 };
    existing.total += 1;
    if (p.outcome === 'won') existing.won += 1;
    trendBuckets.set(key, existing);
  }

  const chartData = Array.from(trendBuckets.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, { total, won: wonCount }]) => ({
      date,
      winRate: total > 0 ? (wonCount / total) * 100 : 0,
      count: total,
    }));

  return (
    <div className="space-y-6">
      <StatsCards
        totalProposals={proposals?.length ?? 0}
        winRate={winRate}
        avgDealValue={avgDealValue}
        wonCount={won.length}
      />

      <Card>
        <CardHeader>
          <CardTitle>Win Rate Trend (Last 30 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          {chartData.length > 0 ? (
            <WinRateChart data={chartData} />
          ) : (
            <p className="text-center py-8 text-muted-foreground">
              Not enough data yet. Send some proposals to see trends.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function AnalyticsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 w-full rounded-lg" />
        ))}
      </div>
      <Skeleton className="h-72 w-full rounded-lg" />
    </div>
  );
}

export default async function AnalyticsPage() {
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">
          Understand your proposal performance
        </p>
      </div>

      {membership ? (
        <Suspense fallback={<AnalyticsSkeleton />}>
          <AnalyticsDashboard orgId={membership.org_id as string} />
        </Suspense>
      ) : (
        <p className="text-muted-foreground">
          Set up your organization to view analytics.
        </p>
      )}
    </div>
  );
}

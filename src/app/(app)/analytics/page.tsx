'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatsCards } from '@/components/analytics/stats-cards';
import { WinRateChart } from '@/components/analytics/win-rate-chart';

const DEMO_CHART_DATA = [
  { date: 'Mar 1', winRate: 33, count: 3 },
  { date: 'Mar 5', winRate: 50, count: 4 },
  { date: 'Mar 8', winRate: 40, count: 5 },
  { date: 'Mar 12', winRate: 60, count: 5 },
  { date: 'Mar 15', winRate: 43, count: 7 },
  { date: 'Mar 18', winRate: 50, count: 6 },
  { date: 'Mar 21', winRate: 42, count: 7 },
];

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">
          Understand your proposal performance
        </p>
      </div>

      <StatsCards
        totalProposals={24}
        winRate={0.42}
        avgDealValue={8450}
        wonCount={8}
      />

      <Card>
        <CardHeader>
          <CardTitle>Win Rate Trend (Last 30 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <WinRateChart data={DEMO_CHART_DATA} />
        </CardContent>
      </Card>
    </div>
  );
}

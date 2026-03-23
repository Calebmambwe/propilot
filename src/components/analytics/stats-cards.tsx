import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  format?: 'number' | 'currency' | 'percent';
}

function StatCard({ label, value, change, changeLabel, format = 'number' }: StatCardProps) {
  const formatted =
    format === 'currency' && typeof value === 'number'
      ? formatCurrency(value)
      : format === 'percent' && typeof value === 'number'
        ? `${(value * 100).toFixed(1)}%`
        : String(value);

  const isPositive = change !== undefined && change > 0;
  const isNegative = change !== undefined && change < 0;
  const isFlat = change !== undefined && change === 0;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{formatted}</div>
        {change !== undefined && (
          <div
            className={cn(
              'flex items-center gap-1 text-xs mt-1',
              isPositive && 'text-green-600',
              isNegative && 'text-red-500',
              isFlat && 'text-muted-foreground',
            )}
          >
            {isPositive && <TrendingUp className="h-3 w-3" />}
            {isNegative && <TrendingDown className="h-3 w-3" />}
            {isFlat && <Minus className="h-3 w-3" />}
            <span>
              {isPositive ? '+' : ''}
              {change.toFixed(1)}% {changeLabel ?? 'vs last period'}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Accept flat props matching the analytics page usage
interface StatsCardsProps {
  totalProposals: number;
  winRate: number;
  avgDealValue: number | null;
  wonCount: number;
}

export function StatsCards({ totalProposals, winRate, avgDealValue, wonCount }: StatsCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        label="Total Proposals"
        value={totalProposals}
        format="number"
      />
      <StatCard
        label="Win Rate"
        value={winRate}
        format="percent"
      />
      <StatCard
        label="Avg Deal Value"
        value={avgDealValue ?? 0}
        format="currency"
      />
      <StatCard
        label="Proposals Won"
        value={wonCount}
        format="number"
      />
    </div>
  );
}

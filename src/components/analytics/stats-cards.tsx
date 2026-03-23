import {
  TrendingUp,
  TrendingDown,
  Minus,
  FileText,
  Trophy,
  DollarSign,
  Target,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: string;
  change?: number;
  changeLabel?: string;
  icon: React.ElementType;
  accent?: string;
}

function StatCard({ label, value, change, changeLabel, icon: Icon, accent = 'text-primary' }: StatCardProps) {
  const isPositive = change !== undefined && change > 0;
  const isNegative = change !== undefined && change < 0;
  const isFlat = change !== undefined && change === 0;

  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-card hover:-translate-y-0.5 hover:shadow-card-hover transition-all duration-200">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
        <div className={cn('flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10', accent.replace('text-', 'bg-').replace('primary', 'primary/10'))}>
          <Icon className={cn('h-4 w-4', accent)} strokeWidth={1.5} />
        </div>
      </div>

      <p className="text-2xl font-bold text-foreground tracking-tight">{value}</p>

      {change !== undefined && (
        <div
          className={cn(
            'flex items-center gap-1 mt-2 text-xs font-medium',
            isPositive && 'text-success',
            isNegative && 'text-destructive',
            isFlat && 'text-muted-foreground',
          )}
        >
          {isPositive && <TrendingUp className="h-3.5 w-3.5" />}
          {isNegative && <TrendingDown className="h-3.5 w-3.5" />}
          {isFlat && <Minus className="h-3.5 w-3.5" />}
          <span>
            {isPositive ? '+' : ''}
            {change.toFixed(1)}% {changeLabel ?? 'vs last period'}
          </span>
        </div>
      )}
    </div>
  );
}

interface StatsCardsProps {
  totalProposals: number;
  winRate: number;
  avgDealValue: number | null;
  wonCount: number;
}

function formatCurrency(v: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v);
}

export function StatsCards({ totalProposals, winRate, avgDealValue, wonCount }: StatsCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        label="Total Proposals"
        value={String(totalProposals)}
        change={14}
        icon={FileText}
        accent="text-primary"
      />
      <StatCard
        label="Win Rate"
        value={`${(winRate * 100).toFixed(1)}%`}
        change={8}
        icon={Target}
        accent="text-success"
      />
      <StatCard
        label="Avg Deal Value"
        value={formatCurrency(avgDealValue ?? 0)}
        change={-3}
        icon={DollarSign}
        accent="text-secondary"
      />
      <StatCard
        label="Proposals Won"
        value={String(wonCount)}
        change={37}
        icon={Trophy}
        accent="text-accent"
      />
    </div>
  );
}

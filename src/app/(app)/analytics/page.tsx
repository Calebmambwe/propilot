'use client';

import { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { StatsCards } from '@/components/analytics/stats-cards';
import { WinRateChart } from '@/components/analytics/win-rate-chart';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

/* ---- Demo data ---- */
const WIN_RATE_TREND = [
  { date: 'Mar 1', winRate: 33 },
  { date: 'Mar 5', winRate: 50 },
  { date: 'Mar 8', winRate: 40 },
  { date: 'Mar 12', winRate: 60 },
  { date: 'Mar 15', winRate: 43 },
  { date: 'Mar 18', winRate: 50 },
  { date: 'Mar 21', winRate: 55 },
];

const PROPOSALS_BY_MONTH = [
  { month: 'Oct', sent: 8, won: 3 },
  { month: 'Nov', sent: 12, won: 5 },
  { month: 'Dec', sent: 7, won: 2 },
  { month: 'Jan', sent: 15, won: 6 },
  { month: 'Feb', sent: 18, won: 7 },
  { month: 'Mar', sent: 24, won: 8 },
];

const OUTCOME_DIST = [
  { name: 'Won', value: 8, color: 'hsl(var(--success))' },
  { name: 'Sent', value: 6, color: 'hsl(var(--primary))' },
  { name: 'Viewed', value: 5, color: 'hsl(var(--accent))' },
  { name: 'Draft', value: 3, color: 'hsl(var(--muted-foreground))' },
  { name: 'Lost', value: 2, color: 'hsl(var(--destructive))' },
];

const SECTION_HEATMAP = [
  { section: 'Pricing Table', readPct: 94, avgTime: '3m 12s', impact: 'high' },
  { section: 'Problem Statement', readPct: 88, avgTime: '2m 44s', impact: 'high' },
  { section: 'Case Studies', readPct: 76, avgTime: '4m 01s', impact: 'high' },
  { section: 'Timeline', readPct: 71, avgTime: '1m 22s', impact: 'medium' },
  { section: 'Team Bios', readPct: 58, avgTime: '1m 55s', impact: 'medium' },
  { section: 'Terms & Conditions', readPct: 32, avgTime: '0m 48s', impact: 'low' },
];

type Range = '7d' | '30d' | '90d';

const RANGES: { label: string; value: Range }[] = [
  { label: '7d', value: '7d' },
  { label: '30d', value: '30d' },
  { label: '90d', value: '90d' },
];

interface CustomBarTooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}

function BarTooltip({ active, payload, label }: CustomBarTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-elevated text-xs">
      <p className="font-medium text-foreground mb-1">{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} style={{ color: entry.color }}>
          {entry.name}: <span className="font-semibold">{entry.value}</span>
        </p>
      ))}
    </div>
  );
}

export default function AnalyticsPage() {
  const [range, setRange] = useState<Range>('30d');

  return (
    <div className="space-y-6 max-w-7xl animate-fade-in">
      {/* ---- Header ---- */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-foreground tracking-tight">Analytics</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Understand your proposal performance
          </p>
        </div>

        {/* Date range picker */}
        <div className="flex items-center gap-0.5 rounded-lg border border-border bg-muted/50 p-0.5">
          {RANGES.map((r) => (
            <button
              key={r.value}
              onClick={() => setRange(r.value)}
              className={cn(
                'rounded-md px-3 py-1.5 text-xs font-medium transition-all duration-150',
                range === r.value
                  ? 'bg-card text-foreground shadow-card'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* ---- KPI row ---- */}
      <div className="animate-fade-in-up">
        <StatsCards
          totalProposals={24}
          winRate={0.42}
          avgDealValue={8450}
          wonCount={8}
        />
      </div>

      {/* ---- Charts row 1 ---- */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Win rate trend */}
        <div className="lg:col-span-2 rounded-xl border border-border bg-card shadow-card p-5 animate-fade-in-up stagger-1">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-sm font-semibold text-foreground">Win Rate Trend</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Daily win rate over selected period</p>
            </div>
            <div className="flex items-center gap-1 text-xs font-medium text-success">
              <TrendingUp className="h-3.5 w-3.5" />
              +8% vs last period
            </div>
          </div>
          <WinRateChart data={WIN_RATE_TREND} height={200} />
        </div>

        {/* Outcome donut */}
        <div className="rounded-xl border border-border bg-card shadow-card p-5 animate-fade-in-up stagger-2">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-foreground">Outcome Distribution</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Breakdown by status</p>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie
                data={OUTCOME_DIST}
                cx="50%"
                cy="50%"
                innerRadius={48}
                outerRadius={72}
                paddingAngle={2}
                dataKey="value"
              >
                {OUTCOME_DIST.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} stroke="transparent" />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const d = payload[0]; if (!d) return null;
                  return (
                    <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-elevated text-xs">
                      <p className="font-medium text-foreground">{d.name}</p>
                      <p className="text-muted-foreground">{d.value} proposals</p>
                    </div>
                  );
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-3 space-y-1.5">
            {OUTCOME_DIST.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full" style={{ background: item.color }} />
                  <span className="text-muted-foreground">{item.name}</span>
                </div>
                <span className="font-medium text-foreground">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ---- Charts row 2 ---- */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Proposals by month */}
        <div className="rounded-xl border border-border bg-card shadow-card p-5 animate-fade-in-up stagger-1">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-sm font-semibold text-foreground">Proposals by Month</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Sent vs won volume</p>
            </div>
            <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-sm bg-primary/70" />Sent
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-sm bg-success/70" />Won
              </span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={PROPOSALS_BY_MONTH} margin={{ top: 0, right: 8, left: -16, bottom: 0 }} barGap={3}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<BarTooltip />} cursor={{ fill: 'hsl(var(--muted) / 0.5)' }} />
              <Bar dataKey="sent" name="Sent" fill="hsl(var(--primary) / 0.7)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="won" name="Won" fill="hsl(var(--success) / 0.7)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Section heatmap */}
        <div className="rounded-xl border border-border bg-card shadow-card p-5 animate-fade-in-up stagger-2">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-foreground">Section Performance</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Which sections prospects read most</p>
          </div>
          <div className="space-y-3">
            {SECTION_HEATMAP.map((s) => (
              <div key={s.section} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-foreground font-medium">{s.section}</span>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <span>{s.avgTime}</span>
                    <span className="font-semibold text-foreground">{s.readPct}%</span>
                  </div>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all duration-500',
                      s.impact === 'high' && 'bg-success/70',
                      s.impact === 'medium' && 'bg-primary/70',
                      s.impact === 'low' && 'bg-muted-foreground/50',
                    )}
                    style={{ width: `${s.readPct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ---- Comparison cards ---- */}
      <div className="grid gap-4 sm:grid-cols-3 animate-fade-in-up stagger-3">
        {[
          { label: 'Avg response time', current: '1.4 days', change: -12, unit: 'faster' },
          { label: 'Proposals with pricing tables', current: '67%', change: 23, unit: 'of total' },
          { label: 'Avg sections per proposal', current: '7.2', change: 5, unit: 'sections' },
        ].map((metric) => (
          <div key={metric.label} className="rounded-xl border border-border bg-card shadow-card p-4">
            <p className="text-xs text-muted-foreground">{metric.label}</p>
            <p className="text-xl font-bold text-foreground mt-1">{metric.current}</p>
            <div className={cn(
              'flex items-center gap-1 mt-1.5 text-xs font-medium',
              metric.change > 0 ? 'text-success' : 'text-destructive',
            )}>
              {metric.change > 0
                ? <TrendingUp className="h-3 w-3" />
                : <TrendingDown className="h-3 w-3" />
              }
              {metric.change > 0 ? '+' : ''}{metric.change}% vs last period
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

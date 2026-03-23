'use client';

import Link from 'next/link';
import {
  FileText,
  TrendingUp,
  DollarSign,
  Trophy,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Plus,
  BarChart3,
  BookTemplate,
  Sparkles,
  Circle,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/* ---- Demo data ---- */
const SPARKLINE_PROPOSALS = [3, 5, 4, 7, 6, 8, 7, 9, 10, 9, 12, 11];
const SPARKLINE_WINRATE = [30, 38, 35, 42, 40, 45, 43, 50, 47, 52, 49, 55];
const SPARKLINE_VALUE = [6000, 7200, 6800, 8100, 7600, 9200, 8450, 9800, 9200, 10400, 9800, 11200];
const SPARKLINE_WON = [2, 3, 2, 4, 3, 5, 4, 6, 5, 7, 6, 8];

const RECENT_PROPOSALS = [
  { id: '1', title: 'Website Redesign Proposal', client: 'Acme Corp', status: 'sent', value: 12000, time: '2h ago' },
  { id: '2', title: 'SEO Audit & Strategy', client: 'TechStart Inc', status: 'won', value: 8500, time: '1d ago' },
  { id: '3', title: 'Brand Identity Package', client: 'GreenLeaf Co', status: 'viewed', value: 15000, time: '3d ago' },
  { id: '4', title: 'Mobile App Development', client: 'FinServ Ltd', status: 'lost', value: 45000, time: '5d ago' },
  { id: '5', title: 'Marketing Automation', client: 'CloudNine SaaS', status: 'draft', value: 6000, time: '1w ago' },
];

const ACTIVITY = [
  { id: '1', type: 'viewed', text: 'Acme Corp viewed your proposal', time: '4m ago', color: 'bg-accent' },
  { id: '2', type: 'won', text: 'TechStart Inc accepted the deal', time: '1h ago', color: 'bg-success' },
  { id: '3', type: 'sent', text: 'Brand Identity proposal sent', time: '3h ago', color: 'bg-primary' },
  { id: '4', type: 'comment', text: 'New comment on Mobile App proposal', time: '5h ago', color: 'bg-secondary' },
  { id: '5', type: 'draft', text: 'Marketing Automation draft saved', time: '1d ago', color: 'bg-muted-foreground' },
  { id: '6', type: 'won', text: 'DataViz Pro deal closed — $18k', time: '2d ago', color: 'bg-success' },
];

const PIPELINE = [
  { stage: 'Draft', count: 5, value: 62000, color: 'bg-muted-foreground/40', pct: 100 },
  { stage: 'Sent', count: 8, value: 112000, color: 'bg-primary/70', pct: 85 },
  { stage: 'Viewed', count: 6, value: 89000, color: 'bg-accent/70', pct: 65 },
  { stage: 'Won', count: 3, value: 47000, color: 'bg-success/80', pct: 40 },
];

/* ---- Status badge ---- */
const STATUS_CLASSES: Record<string, string> = {
  won: 'status-won',
  sent: 'status-sent',
  viewed: 'status-viewed',
  lost: 'status-lost',
  draft: 'status-draft',
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
        STATUS_CLASSES[status] ?? 'status-draft',
      )}
    >
      {status}
    </span>
  );
}

/* ---- Tiny sparkline ---- */
function Sparkline({ data, color = 'hsl(var(--primary))' }: { data: number[]; color?: string }) {
  const chartData = data.map((v, i) => ({ i, v }));
  return (
    <ResponsiveContainer width="100%" height={40}>
      <AreaChart data={chartData} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={`sg-${color.replace(/[()%,\s]/g, '')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.3} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="v"
          stroke={color}
          strokeWidth={1.5}
          fill={`url(#sg-${color.replace(/[()%,\s]/g, '')})`}
          dot={false}
          isAnimationActive={false}
        />
        <Tooltip content={() => null} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

/* ---- KPI card ---- */
interface KpiCardProps {
  label: string;
  value: string;
  change: number;
  changeLabel: string;
  icon: React.ElementType;
  sparkData: number[];
  sparkColor: string;
  delay?: string;
}

function KpiCard({ label, value, change, changeLabel, icon: Icon, sparkData, sparkColor, delay }: KpiCardProps) {
  const isUp = change > 0;
  const isFlat = change === 0;

  return (
    <div
      className={cn(
        'rounded-xl border border-border bg-card p-4 shadow-card',
        'hover:-translate-y-0.5 hover:shadow-card-hover transition-all duration-200',
        'animate-fade-in-up',
      )}
      style={delay ? { animationDelay: delay } : undefined}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {label}
        </span>
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
          <Icon className="h-3.5 w-3.5 text-primary" strokeWidth={1.5} />
        </div>
      </div>

      <div className="text-2xl font-bold text-foreground tracking-tight">{value}</div>

      <div className="mt-1 flex items-center gap-1">
        {isFlat ? (
          <Minus className="h-3 w-3 text-muted-foreground" />
        ) : isUp ? (
          <ArrowUpRight className="h-3 w-3 text-success" />
        ) : (
          <ArrowDownRight className="h-3 w-3 text-destructive" />
        )}
        <span
          className={cn(
            'text-[11px] font-medium',
            isFlat ? 'text-muted-foreground' : isUp ? 'text-success' : 'text-destructive',
          )}
        >
          {isUp ? '+' : ''}{change}% {changeLabel}
        </span>
      </div>

      <div className="mt-3 -mx-1">
        <Sparkline data={sparkData} color={sparkColor} />
      </div>
    </div>
  );
}

/* ---- Greeting ---- */
function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function formatDate() {
  return new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}

function formatCurrency(v: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v);
}

/* ---- Page ---- */
export default function DashboardPage() {
  return (
    <div className="space-y-6 max-w-7xl">
      {/* ---- Header greeting ---- */}
      <div className="animate-fade-in-up">
        <p className="text-xs text-muted-foreground mb-0.5">{formatDate()}</p>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">
          {getGreeting()}, Caleb
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Here&apos;s what&apos;s happening with your proposals today.
        </p>
      </div>

      {/* ---- Quick actions ---- */}
      <div className="flex flex-wrap gap-2 animate-fade-in-up stagger-1">
        <Button size="sm" className="gap-1.5 rounded-lg" asChild>
          <Link href="/proposals/new">
            <Plus className="h-3.5 w-3.5" />
            New Proposal
          </Link>
        </Button>
        <Button variant="outline" size="sm" className="gap-1.5 rounded-lg" asChild>
          <Link href="/analytics">
            <BarChart3 className="h-3.5 w-3.5" />
            View Analytics
          </Link>
        </Button>
        <Button variant="outline" size="sm" className="gap-1.5 rounded-lg" asChild>
          <Link href="/templates">
            <BookTemplate className="h-3.5 w-3.5" />
            Browse Templates
          </Link>
        </Button>
      </div>

      {/* ---- KPI cards ---- */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Total Proposals"
          value="24"
          change={14}
          changeLabel="vs last month"
          icon={FileText}
          sparkData={SPARKLINE_PROPOSALS}
          sparkColor="hsl(var(--primary))"
          delay="60ms"
        />
        <KpiCard
          label="Win Rate"
          value="42%"
          change={8}
          changeLabel="vs last month"
          icon={TrendingUp}
          sparkData={SPARKLINE_WINRATE}
          sparkColor="hsl(var(--success))"
          delay="120ms"
        />
        <KpiCard
          label="Avg Deal Value"
          value="$8,450"
          change={-3}
          changeLabel="vs last month"
          icon={DollarSign}
          sparkData={SPARKLINE_VALUE}
          sparkColor="hsl(var(--secondary))"
          delay="180ms"
        />
        <KpiCard
          label="Proposals Won"
          value="8"
          change={37}
          changeLabel="vs last month"
          icon={Trophy}
          sparkData={SPARKLINE_WON}
          sparkColor="hsl(var(--accent))"
          delay="240ms"
        />
      </div>

      {/* ---- Main content grid ---- */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* ---- Left 2/3 ---- */}
        <div className="space-y-4 lg:col-span-2">
          {/* AI Insight callout */}
          <div
            className={cn(
              'rounded-xl border border-primary/20 bg-primary/5 p-4',
              'flex items-start gap-3 animate-fade-in-up stagger-2',
            )}
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/15">
              <Sparkles className="h-4 w-4 text-primary" strokeWidth={1.5} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground">AI Insight</p>
              <p className="text-sm text-muted-foreground mt-0.5">
                Proposals with pricing tables have a{' '}
                <span className="font-semibold text-primary">2.3x higher win rate</span>.
                Your last 3 won deals all included interactive pricing.
              </p>
              <Button variant="link" size="sm" className="h-auto p-0 mt-1 text-xs text-primary" asChild>
                <Link href="/analytics">See full breakdown →</Link>
              </Button>
            </div>
          </div>

          {/* Pipeline funnel */}
          <div className="rounded-xl border border-border bg-card shadow-card p-5 animate-fade-in-up stagger-3">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-foreground">Proposal Pipeline</h2>
              <span className="text-xs text-muted-foreground">Last 30 days</span>
            </div>
            <div className="space-y-2.5">
              {PIPELINE.map((stage) => (
                <div key={stage.stage} className="flex items-center gap-3">
                  <div className="w-16 shrink-0 text-xs text-muted-foreground">{stage.stage}</div>
                  <div className="flex-1 bg-muted rounded-full h-7 relative overflow-hidden">
                    <div
                      className={cn('h-full rounded-full flex items-center justify-end pr-2 transition-all duration-500', stage.color)}
                      style={{ width: `${stage.pct}%` }}
                    >
                      <span className="text-[10px] font-semibold text-foreground/80">{stage.count}</span>
                    </div>
                  </div>
                  <div className="w-20 shrink-0 text-right text-xs text-muted-foreground">
                    {formatCurrency(stage.value)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent proposals */}
          <div className="rounded-xl border border-border bg-card shadow-card animate-fade-in-up stagger-4">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h2 className="text-sm font-semibold text-foreground">Recent Proposals</h2>
              <Button variant="ghost" size="sm" className="h-7 text-xs" asChild>
                <Link href="/proposals">View all →</Link>
              </Button>
            </div>
            <div className="divide-y divide-border">
              {RECENT_PROPOSALS.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center gap-3 px-5 py-3 hover:bg-muted/30 transition-colors duration-150 group"
                >
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/proposals/${p.id}/edit`}
                      className="text-sm font-medium text-foreground hover:text-primary transition-colors duration-150 truncate block"
                    >
                      {p.title}
                    </Link>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">
                      {p.client} &middot; {formatCurrency(p.value)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <StatusBadge status={p.status} />
                    <span className="text-[10px] text-muted-foreground hidden sm:inline">{p.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ---- Right 1/3: Activity timeline ---- */}
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-card shadow-card h-fit animate-fade-in-up stagger-2">
            <div className="px-5 py-4 border-b border-border">
              <h2 className="text-sm font-semibold text-foreground">Activity</h2>
            </div>
            <div className="p-4">
              <div className="relative">
                {/* Vertical line */}
                <div className="absolute left-[7px] top-2 bottom-2 w-px bg-border" aria-hidden />

                <div className="space-y-4">
                  {ACTIVITY.map((item) => (
                    <div key={item.id} className="relative flex gap-3 pl-1">
                      <div
                        className={cn(
                          'relative z-10 mt-0.5 flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full ring-2 ring-card',
                          item.color,
                        )}
                        aria-hidden
                      >
                        <Circle className="h-1.5 w-1.5 fill-current text-card" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-foreground leading-snug">{item.text}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{item.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Quick stats */}
          <div className="rounded-xl border border-border bg-card shadow-card p-5 animate-fade-in-up stagger-3">
            <h2 className="text-sm font-semibold text-foreground mb-3">This week</h2>
            <div className="space-y-3">
              {[
                { label: 'Proposals sent', value: '4', icon: FileText },
                { label: 'Deals won', value: '2', icon: Trophy },
                { label: 'Revenue closed', value: '$26.5k', icon: DollarSign },
              ].map((stat) => {
                const Icon = stat.icon;
                return (
                  <div key={stat.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Icon className="h-3.5 w-3.5" strokeWidth={1.5} />
                      {stat.label}
                    </div>
                    <span className="text-sm font-semibold text-foreground">{stat.value}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

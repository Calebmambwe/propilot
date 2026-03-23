'use client';

import Link from 'next/link';
import {
  Check,
  CreditCard,
  ChevronRight,
  Zap,
  Users,
  Building2,
  FileText,
  TrendingUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const PLANS = [
  {
    id: 'solo' as const,
    name: 'Solo',
    price: 49,
    description: 'Perfect for freelancers and solo consultants',
    features: [
      '1 user seat',
      'Unlimited proposals',
      'AI generation (20/hour)',
      'Email tracking',
      'Analytics dashboard',
      '"Powered by ProPilot" footer',
    ],
    cta: 'Downgrade to Solo',
    popular: false,
  },
  {
    id: 'team' as const,
    name: 'Team',
    price: 99,
    description: 'For growing agencies and small teams',
    features: [
      'Up to 5 user seats',
      'Unlimited proposals',
      'AI generation (50/hour)',
      'Email tracking',
      'Full analytics suite',
      'Remove "Powered by ProPilot"',
    ],
    cta: 'Current plan',
    popular: true,
  },
  {
    id: 'agency' as const,
    name: 'Agency',
    price: 199,
    description: 'For agencies with large teams and clients',
    features: [
      'Up to 25 user seats',
      'Unlimited proposals',
      'AI generation (unlimited)',
      'Email tracking',
      'Full analytics suite',
      'White-label footer',
      'Priority support',
    ],
    cta: 'Upgrade to Agency',
    popular: false,
  },
];

const USAGE_STATS = [
  {
    label: 'Proposals sent',
    value: 14,
    max: null,
    icon: FileText,
    subtext: 'This month',
  },
  {
    label: 'AI generations',
    value: 38,
    max: 50,
    icon: Zap,
    subtext: 'Per hour limit',
    showBar: true,
  },
  {
    label: 'Team seats',
    value: 3,
    max: 5,
    icon: Users,
    subtext: '2 seats available',
    showBar: true,
  },
];

const SETTINGS_NAV = [
  { href: '/settings', label: 'Account', icon: Building2 },
  { href: '/settings/billing', label: 'Billing & Plan', icon: CreditCard },
  { href: '/settings/team', label: 'Team', icon: Users },
];

export default function BillingPage() {
  const currentPlanId = 'team';

  return (
    <div className="max-w-3xl space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-foreground tracking-tight">Billing & Plan</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Manage your subscription, usage, and billing details
        </p>
      </div>

      {/* Settings sub-nav */}
      <div className="flex items-center gap-0.5 rounded-lg border border-border bg-muted/30 p-0.5 w-fit">
        {SETTINGS_NAV.map((item) => {
          const Icon = item.icon;
          const isActive = item.href === '/settings/billing';
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all duration-150',
                isActive
                  ? 'bg-card text-foreground shadow-card'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <Icon className="h-3 w-3" strokeWidth={1.5} />
              {item.label}
            </Link>
          );
        })}
      </div>

      {/* Current plan card */}
      <div className="rounded-xl border border-primary/30 bg-primary/5 p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15">
              <Zap className="h-5 w-5 text-primary" strokeWidth={1.5} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold text-foreground">Team Plan</p>
                <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold text-primary">
                  Active
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                $99/month · Renews Apr 23, 2026
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 text-xs rounded-lg shrink-0"
          >
            <CreditCard className="h-3.5 w-3.5" />
            Manage subscription
          </Button>
        </div>
      </div>

      {/* Usage stats */}
      <div className="rounded-xl border border-border bg-card shadow-card p-5 space-y-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
          <h2 className="text-sm font-semibold text-foreground">Usage this month</h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {USAGE_STATS.map((stat) => {
            const Icon = stat.icon;
            const pct = stat.max ? Math.round((stat.value / stat.max) * 100) : null;
            return (
              <div key={stat.label} className="space-y-2">
                <div className="flex items-center gap-2">
                  <Icon className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.5} />
                  <span className="text-xs text-muted-foreground">{stat.label}</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-foreground tabular-nums">{stat.value}</span>
                  {stat.max && (
                    <span className="text-xs text-muted-foreground">/ {stat.max}</span>
                  )}
                </div>
                {stat.showBar && pct !== null && (
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all duration-300',
                        pct >= 90 ? 'bg-destructive' : pct >= 70 ? 'bg-secondary' : 'bg-primary',
                      )}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                )}
                <p className="text-[10px] text-muted-foreground">{stat.subtext}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Plan comparison */}
      <div>
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
          All Plans
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {PLANS.map((plan) => {
            const isCurrent = plan.id === currentPlanId;
            return (
              <div
                key={plan.id}
                className={cn(
                  'relative flex flex-col rounded-xl border bg-card shadow-card overflow-hidden',
                  'transition-all duration-200',
                  isCurrent
                    ? 'border-primary/40 shadow-md'
                    : 'border-border hover:-translate-y-0.5 hover:shadow-card-hover',
                )}
              >
                {plan.popular && (
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-accent" />
                )}
                {isCurrent && (
                  <div className="absolute top-3 right-3">
                    <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold text-primary">
                      Current
                    </span>
                  </div>
                )}

                <div className="p-5 pb-4">
                  <p className="text-sm font-bold text-foreground">{plan.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{plan.description}</p>
                  <div className="mt-3 flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-foreground tabular-nums">${plan.price}</span>
                    <span className="text-xs text-muted-foreground">/mo</span>
                  </div>
                </div>

                <div className="flex-1 px-5 pb-4 space-y-2">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-start gap-2">
                      <Check className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" strokeWidth={2.5} />
                      <span className="text-xs text-muted-foreground">{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="px-5 pb-5">
                  <Button
                    variant={isCurrent ? 'outline' : plan.popular ? 'default' : 'outline'}
                    size="sm"
                    className="w-full h-8 text-xs rounded-lg"
                    disabled={isCurrent}
                  >
                    {plan.cta}
                    {!isCurrent && <ChevronRight className="h-3.5 w-3.5 ml-1" />}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Billing info */}
      <div className="rounded-xl border border-border bg-card shadow-card p-5">
        <h2 className="text-sm font-semibold text-foreground mb-4">Payment method</h2>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-14 items-center justify-center rounded-lg border border-border bg-muted text-xs font-bold text-muted-foreground">
              VISA
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Visa ending in 4242</p>
              <p className="text-xs text-muted-foreground mt-0.5">Expires 12/2027</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="h-8 text-xs rounded-lg gap-1.5">
            <CreditCard className="h-3.5 w-3.5" />
            Update
          </Button>
        </div>
      </div>
    </div>
  );
}

import { Suspense } from 'react';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatRelativeTime } from '@/lib/utils';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import type { ProposalStatus } from '@/types/domain';

async function DashboardStats({ orgId }: { orgId: string }) {
  const supabase = await createClient();

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [{ data: proposals }, { data: recentProposals }] = await Promise.all([
    supabase
      .from('proposals')
      .select('id, outcome, deal_value')
      .eq('org_id', orgId)
      .gte('created_at', thirtyDaysAgo.toISOString()),
    supabase
      .from('proposals')
      .select('id, title, client_name, status, created_at')
      .eq('org_id', orgId)
      .order('created_at', { ascending: false })
      .limit(5),
  ]);

  const decided = (proposals ?? []).filter(
    (p) => p.outcome === 'won' || p.outcome === 'lost',
  );
  const won = decided.filter((p) => p.outcome === 'won');
  const winRate = decided.length > 0 ? (won.length / decided.length) * 100 : 0;
  const avgDealValue =
    won.length > 0
      ? won
          .filter((p) => p.deal_value != null)
          .reduce((sum, p) => sum + (p.deal_value as number), 0) /
        won.filter((p) => p.deal_value != null).length
      : null;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Proposals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{proposals?.length ?? 0}</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{winRate.toFixed(0)}%</div>
            <p className="text-xs text-muted-foreground">
              {won.length} won / {decided.length} decided
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Deal Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(avgDealValue)}</div>
            <p className="text-xs text-muted-foreground">Won proposals</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Proposals Won</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{won.length}</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Proposals</CardTitle>
          <Button variant="outline" size="sm" asChild>
            <Link href="/proposals">View all</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {recentProposals && recentProposals.length > 0 ? (
            <div className="space-y-3">
              {recentProposals.map((p) => (
                <div
                  key={p.id as string}
                  className="flex items-center justify-between py-2 border-b last:border-0"
                >
                  <div>
                    <Link
                      href={`/proposals/${p.id as string}/edit`}
                      className="font-medium hover:underline"
                    >
                      {p.title as string}
                    </Link>
                    <p className="text-sm text-muted-foreground">
                      {p.client_name as string} &middot;{' '}
                      {formatRelativeTime(p.created_at as string)}
                    </p>
                  </div>
                  <Badge
                    variant={
                      p.status === 'won'
                        ? 'default'
                        : p.status === 'lost'
                          ? 'destructive'
                          : 'secondary'
                    }
                  >
                    {p.status as ProposalStatus}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No proposals yet.</p>
              <Button asChild className="mt-4">
                <Link href="/proposals/new">Create your first proposal</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function DashboardStatsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-1" />
              <Skeleton className="h-3 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Get user's org
  const { data: membership } = await supabase
    .from('organization_members')
    .select('org_id')
    .eq('user_id', user.id)
    .limit(1)
    .single();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Your proposal performance at a glance
        </p>
      </div>

      {membership ? (
        <Suspense fallback={<DashboardStatsSkeleton />}>
          <DashboardStats orgId={membership.org_id as string} />
        </Suspense>
      ) : (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">
              You are not part of any organization yet.
            </p>
            <Button asChild className="mt-4">
              <Link href="/settings">Set up your organization</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

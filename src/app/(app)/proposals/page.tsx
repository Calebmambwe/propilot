import { Suspense } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ProposalCard } from '@/components/proposals/proposal-card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { ProposalStatus } from '@/types/domain';

type SearchParams = Promise<{ status?: string; page?: string }>;

async function ProposalList({
  orgId,
  status,
  page,
}: {
  orgId: string;
  status?: string;
  page: number;
}) {
  const supabase = await createClient();
  const limit = 20;
  const offset = (page - 1) * limit;

  let query = supabase
    .from('proposals')
    .select(
      'id, slug, title, client_name, client_company, deal_value, status, outcome, sent_at, first_opened_at, created_at',
      { count: 'exact' },
    )
    .eq('org_id', orgId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (status && status !== 'all') {
    query = query.eq('status', status);
  }

  const { data: proposals, count } = await query;

  if (!proposals || proposals.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground mb-4">No proposals found</p>
          <Button asChild>
            <Link href="/proposals/new">Create your first proposal</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4">
        {proposals.map((p) => (
          <ProposalCard
            key={p.id as string}
            id={p.id as string}
            slug={p.slug as string}
            title={p.title as string}
            clientName={p.client_name as string}
            clientCompany={p.client_company as string | null}
            dealValue={p.deal_value as number | null}
            status={p.status as ProposalStatus}
            outcome={null}
            sentAt={p.sent_at as string | null}
            firstOpenedAt={p.first_opened_at as string | null}
            createdAt={p.created_at as string}
          />
        ))}
      </div>
      {(count ?? 0) > limit && (
        <p className="text-sm text-muted-foreground text-center">
          Showing {Math.min(offset + limit, count ?? 0)} of {count} proposals
        </p>
      )}
    </div>
  );
}

function ProposalListSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-24 w-full rounded-lg" />
      ))}
    </div>
  );
}

export default async function ProposalsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const status = params.status ?? 'all';
  const page = Number(params.page ?? 1);

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

  const statuses: Array<{ value: string; label: string }> = [
    { value: 'all', label: 'All' },
    { value: 'draft', label: 'Drafts' },
    { value: 'sent', label: 'Sent' },
    { value: 'opened', label: 'Opened' },
    { value: 'won', label: 'Won' },
    { value: 'lost', label: 'Lost' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Proposals</h1>
          <p className="text-muted-foreground">Manage and track your proposals</p>
        </div>
        <Button asChild>
          <Link href="/proposals/new">New proposal</Link>
        </Button>
      </div>

      <Tabs defaultValue={status}>
        <TabsList>
          {statuses.map((s) => (
            <TabsTrigger key={s.value} value={s.value} asChild>
              <Link href={`/proposals?status=${s.value}`}>{s.label}</Link>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {membership ? (
        <Suspense fallback={<ProposalListSkeleton />}>
          <ProposalList
            orgId={membership.org_id as string}
            status={status === 'all' ? undefined : status}
            page={page}
          />
        </Suspense>
      ) : (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Set up your organization to start creating proposals.
          </CardContent>
        </Card>
      )}
    </div>
  );
}

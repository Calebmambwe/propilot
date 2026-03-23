'use client';

import { useTRPC } from '@/trpc/client';
import { useQuery } from '@tanstack/react-query';

type Period = '30d' | '90d' | '12m';

interface UseAnalyticsOptions {
  orgId: string;
  period?: Period;
}

export function useAnalyticsOverview({ orgId, period = '30d' }: UseAnalyticsOptions) {
  const trpc = useTRPC();

  return useQuery(
    trpc.analytics.overview.queryOptions({ orgId, period }),
  );
}

export function useSectionPerformance({ orgId, period = '30d' }: UseAnalyticsOptions) {
  const trpc = useTRPC();

  return useQuery(
    trpc.analytics.sectionPerformance.queryOptions({ orgId, period }),
  );
}

export function usePricingInsights({ orgId }: { orgId: string }) {
  const trpc = useTRPC();

  return useQuery(
    trpc.analytics.pricingInsights.queryOptions({ orgId }),
  );
}

export function useProposalTracking(proposalId: string) {
  const trpc = useTRPC();

  return useQuery(
    trpc.analytics.proposalTracking.queryOptions({ proposalId }),
  );
}

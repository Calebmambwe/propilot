'use client';

import { useTRPC } from '@/trpc/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface UseProposalsOptions {
  orgId: string;
  status?: 'draft' | 'sent' | 'opened' | 'won' | 'lost' | 'expired';
  page?: number;
  limit?: number;
}

export function useProposals({ orgId, status, page = 1, limit = 20 }: UseProposalsOptions) {
  const trpc = useTRPC();

  return useQuery(
    trpc.proposals.list.queryOptions({ orgId, status, page, limit }),
  );
}

export function useProposal(id: string) {
  const trpc = useTRPC();

  return useQuery(
    trpc.proposals.getById.queryOptions({ id }),
  );
}

export function useCreateProposal() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.proposals.create.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: ['proposals'] });
      },
    }),
  );
}

export function useUpdateProposal() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.proposals.update.mutationOptions({
      onSuccess: (_data, variables: { id: string }) => {
        void queryClient.invalidateQueries({
          queryKey: trpc.proposals.getById.queryKey({ id: variables.id }),
        });
      },
    }),
  );
}

export function useSendProposal() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.proposals.send.mutationOptions({
      onSuccess: (_data, variables: { id: string }) => {
        void queryClient.invalidateQueries({
          queryKey: trpc.proposals.getById.queryKey({ id: variables.id }),
        });
        void queryClient.invalidateQueries({ queryKey: ['proposals'] });
      },
    }),
  );
}

export function useMarkOutcome() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.proposals.markOutcome.mutationOptions({
      onSuccess: (_data, variables: { id: string; outcome: 'won' | 'lost'; reason?: string }) => {
        void queryClient.invalidateQueries({
          queryKey: trpc.proposals.getById.queryKey({ id: variables.id }),
        });
        void queryClient.invalidateQueries({ queryKey: ['proposals'] });
      },
    }),
  );
}

export function useDeleteProposal() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.proposals.delete.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: ['proposals'] });
      },
    }),
  );
}

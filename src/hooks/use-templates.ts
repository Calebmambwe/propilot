'use client';

import { useTRPC } from '@/trpc/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export function useTemplates({ orgId }: { orgId: string }) {
  const trpc = useTRPC();

  return useQuery(
    trpc.templates.list.queryOptions({ orgId }),
  );
}

export function useTemplate(id: string) {
  const trpc = useTRPC();

  return useQuery(
    trpc.templates.getById.queryOptions({ id }),
  );
}

export function useCreateTemplate() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.templates.create.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: ['templates'] });
      },
    }),
  );
}

export function useUpdateTemplate() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.templates.update.mutationOptions({
      onSuccess: (_data, variables: { id: string }) => {
        void queryClient.invalidateQueries({
          queryKey: trpc.templates.getById.queryKey({ id: variables.id }),
        });
        void queryClient.invalidateQueries({ queryKey: ['templates'] });
      },
    }),
  );
}

export function useDeleteTemplate() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.templates.delete.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: ['templates'] });
      },
    }),
  );
}

import 'server-only';
import { createHydrationHelpers } from '@trpc/react-query/rsc';
import { cache } from 'react';
import { createCaller, type AppRouter } from '@/server/api/root';
import { createTRPCContext } from '@/server/trpc';
import { makeQueryClient } from './query-client';

export const getQueryClient = cache(makeQueryClient);

const caller = createCaller(
  cache(() => createTRPCContext({ headers: new Headers() })),
);

export const { trpc: api, HydrateClient } = createHydrationHelpers<AppRouter>(
  caller,
  getQueryClient,
);

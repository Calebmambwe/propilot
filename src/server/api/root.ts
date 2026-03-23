import { createCallerFactory, createTRPCRouter } from '@/server/trpc';
import { proposalsRouter } from '@/server/api/routers/proposals';
import { templatesRouter } from '@/server/api/routers/templates';
import { organizationsRouter } from '@/server/api/routers/organizations';
import { billingRouter } from '@/server/api/routers/billing';
import { analyticsRouter } from '@/server/api/routers/analytics';

export const appRouter = createTRPCRouter({
  proposals: proposalsRouter,
  templates: templatesRouter,
  organizations: organizationsRouter,
  billing: billingRouter,
  analytics: analyticsRouter,
});

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);

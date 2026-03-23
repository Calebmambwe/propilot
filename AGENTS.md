# ProPilot — Agent Instructions

This file documents hard-won lessons and patterns specific to the ProPilot codebase.
Read this before making any changes.

## Import Paths

- `cuid2`: `import { createId } from 'cuid2'` (NOT `@paralleldrive/cuid2`)
- Supabase browser: `import { createClient } from '@/lib/supabase/client'`
- Supabase server: `import { createClient } from '@/lib/supabase/server'`
- tRPC server caller: `import { api } from '@/trpc/server'`
- tRPC React: `import { useTRPC } from '@/trpc/client'`

## Supabase Query Pattern

Always use typed casts when accessing Supabase row data, since we don't have generated types yet:

```typescript
const id = row.id as string;
const value = row.deal_value as number | null;
```

After running `pnpm db:types`, import from `@/types/supabase` and update the pattern.

## tRPC Context

`ctx.user` is always defined in `protectedProcedure` (TypeScript enforces this).
`ctx.supabase` is the user-scoped RLS client — all queries run as the authenticated user.

## Error Handling in tRPC

Always use `TRPCError` with a code:
- `NOT_FOUND` for missing records
- `FORBIDDEN` for authorization failures
- `BAD_REQUEST` for invalid state transitions
- `INTERNAL_ERROR` for unexpected DB errors (include `cause: error`)

## Server vs Client Components

Avoid `'use client'` unless the component needs:
- `useState`, `useEffect`, or other React hooks
- Browser APIs (IntersectionObserver, sendBeacon, etc.)
- tRPC mutations (useMutation)
- Event handlers

## Form Pattern

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const Schema = z.object({ ... });
type FormData = z.infer<typeof Schema>;

const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
  resolver: zodResolver(Schema),
  defaultValues: { ... },
});
```

## Tracking Architecture

The tracking system has three parts:
1. **Pixel** (`/api/track/open/[id]`) — 1x1 GIF, fires on page load, marks proposal as `opened`
2. **Events** (`/api/track/events`) — batched events from `TrackingScript` component
3. **TrackingScript** — client component using IntersectionObserver + sendBeacon

All tracking data is stored in `tracking_events` table with hashed IP/UA for privacy.

## Subscription Check Pattern

Before allowing premium actions, check:
```typescript
const { data: subscription } = await ctx.supabase
  .from('subscriptions')
  .select('status')
  .eq('org_id', orgId)
  .single();

if (subscription && !['active', 'trialing'].includes(subscription.status as string)) {
  throw new TRPCError({ code: 'FORBIDDEN', message: '...' });
}
```

A missing subscription row means the org is on a free/trial plan — allow action unless
explicitly requiring paid features.

## Known TODOs (planned for M3)

- Email sending via Resend in `proposals.send` mutation
- AI coaching via Anthropic in `ai_coaching_logs`
- Rate limiting on tracking endpoints via `@upstash/ratelimit`
- White-label support (`org.white_label` flag on public proposal page)

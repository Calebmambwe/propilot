import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createHash } from 'crypto';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { env } from '@/lib/env';

const MAX_EVENTS_PER_BATCH = 50;
const MAX_EVENT_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours

const TrackingEventSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('section_enter'),
    sectionId: z.string().uuid(),
    occurredAt: z.string().datetime(),
  }),
  z.object({
    type: z.literal('section_exit'),
    sectionId: z.string().uuid(),
    durationMs: z.number().int().min(0).max(3_600_000),
    occurredAt: z.string().datetime(),
  }),
  z.object({
    type: z.literal('link_click'),
    linkUrl: z.string().url(),
    occurredAt: z.string().datetime(),
  }),
  z.object({
    type: z.literal('download'),
    occurredAt: z.string().datetime(),
  }),
]);

const BatchRequestSchema = z.object({
  proposalId: z.string().uuid(),
  events: z.array(TrackingEventSchema).min(1).max(MAX_EVENTS_PER_BATCH),
});

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  // CORS — tracking script can be loaded from any origin
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: { code: 'VALIDATION_ERROR', message: 'Invalid JSON body' } },
      { status: 400, headers: corsHeaders },
    );
  }

  const parsed = BatchRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid event batch',
          details: parsed.error.flatten().fieldErrors,
        },
      },
      { status: 400, headers: corsHeaders },
    );
  }

  const { proposalId, events } = parsed.data;
  const now = Date.now();

  // Replay protection: reject events older than 24h
  for (const event of events) {
    const eventTime = new Date(event.occurredAt).getTime();
    if (now - eventTime > MAX_EVENT_AGE_MS) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Event timestamp is too old (max 24 hours)',
          },
        },
        { status: 400, headers: corsHeaders },
      );
    }
  }

  const supabase = await createServiceRoleClient();

  // Verify proposal exists and is not expired
  const { data: proposal } = await supabase
    .from('proposals')
    .select('id, expires_at, status')
    .eq('id', proposalId)
    .single();

  if (!proposal) {
    // Silently accept to not reveal proposal existence
    return NextResponse.json(
      { data: { received: 0 } },
      { status: 202, headers: corsHeaders },
    );
  }

  // Drop events for expired proposals silently
  if (
    proposal.expires_at &&
    new Date(proposal.expires_at as string) < new Date()
  ) {
    return NextResponse.json(
      { data: { received: 0 } },
      { status: 202, headers: corsHeaders },
    );
  }

  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0] ??
    request.headers.get('x-real-ip') ??
    'unknown';
  const userAgent = request.headers.get('user-agent') ?? 'unknown';
  const salt = env.TRACKING_HASH_SALT;
  const ipHash = createHash('sha256').update(ip + salt).digest('hex');
  const userAgentHash = createHash('sha256')
    .update(userAgent + salt)
    .digest('hex');

  const rows = events.map((event) => {
    const base = {
      proposal_id: proposalId,
      event_type: event.type,
      ip_hash: ipHash,
      user_agent_hash: userAgentHash,
      occurred_at: event.occurredAt,
    };

    if (event.type === 'section_enter') {
      return { ...base, section_id: event.sectionId };
    }
    if (event.type === 'section_exit') {
      return {
        ...base,
        section_id: event.sectionId,
        duration_ms: event.durationMs,
      };
    }
    if (event.type === 'link_click') {
      return { ...base, link_url: event.linkUrl };
    }
    return base;
  });

  const { error } = await supabase.from('tracking_events').insert(rows);

  if (error) {
    console.error('[Track Events] Insert failed:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to record events' } },
      { status: 500, headers: corsHeaders },
    );
  }

  return NextResponse.json(
    { data: { received: events.length } },
    { status: 202, headers: corsHeaders },
  );
}

// Preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

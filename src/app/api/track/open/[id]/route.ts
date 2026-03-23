import { type NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { env } from '@/lib/env';

// 1x1 transparent GIF (35 bytes)
const TRACKING_GIF = Buffer.from(
  'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
  'base64',
);

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: proposalId } = await params;

  const gifResponse = new NextResponse(TRACKING_GIF, {
    status: 200,
    headers: {
      'Content-Type': 'image/gif',
      'Content-Length': String(TRACKING_GIF.length),
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      Pragma: 'no-cache',
      Expires: '0',
      'X-Content-Type-Options': 'nosniff',
    },
  });

  // Hash IP for privacy — never store raw
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

  // Fire-and-forget tracking — don't delay the GIF response
  void (async () => {
    try {
      const supabase = await createServiceRoleClient();

      // Insert tracking event
      await supabase.from('tracking_events').insert({
        proposal_id: proposalId,
        event_type: 'open',
        ip_hash: ipHash,
        user_agent_hash: userAgentHash,
        occurred_at: new Date().toISOString(),
      });

      // Update proposal on first open (upsert-style: only if still 'sent')
      await supabase
        .from('proposals')
        .update({
          status: 'opened',
          first_opened_at: new Date().toISOString(),
        })
        .eq('id', proposalId)
        .eq('status', 'sent');
    } catch (err) {
      // Silent — never fail the tracking pixel response
      console.error('[Tracking pixel] Failed to record open event:', err);
    }
  })();

  return gifResponse;
}

import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { createTRPCRouter, protectedProcedure } from '@/server/trpc';
import type { TrackingEventType } from '@/types/domain';

const PeriodSchema = z.enum(['30d', '90d', '12m']);

function getPeriodStart(period: '30d' | '90d' | '12m'): Date {
  const now = new Date();
  switch (period) {
    case '30d':
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    case '90d':
      return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    case '12m':
      return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
  }
}

export const analyticsRouter = createTRPCRouter({
  overview: protectedProcedure
    .input(
      z.object({
        orgId: z.string().uuid(),
        period: PeriodSchema,
      }),
    )
    .query(async ({ ctx, input }) => {
      const periodStart = getPeriodStart(input.period);

      const { data: proposals } = await ctx.supabase
        .from('proposals')
        .select('id, status, outcome, deal_value, sent_at, first_opened_at, created_at')
        .eq('org_id', input.orgId)
        .gte('created_at', periodStart.toISOString());

      if (!proposals) {
        return {
          totalProposals: 0,
          winRate: 0,
          avgDealValue: null,
          avgTimeToDecision: null,
          winRateTrend: [],
        };
      }

      const decided = proposals.filter(
        (p) => p.outcome === 'won' || p.outcome === 'lost',
      );
      const won = decided.filter((p) => p.outcome === 'won');
      const winRate = decided.length > 0 ? won.length / decided.length : 0;

      const wonWithValue = won.filter((p) => p.deal_value != null);
      const avgDealValue =
        wonWithValue.length > 0
          ? wonWithValue.reduce((sum, p) => sum + (p.deal_value as number), 0) /
            wonWithValue.length
          : null;

      // Avg time-to-decision: from sent_at to outcome
      const withTimestamps = decided.filter(
        (p) => p.sent_at && p.first_opened_at,
      );
      const avgTimeToDecision =
        withTimestamps.length > 0
          ? withTimestamps.reduce((sum, p) => {
              const sent = new Date(p.sent_at as string).getTime();
              const opened = new Date(p.first_opened_at as string).getTime();
              return sum + (opened - sent) / (1000 * 60 * 60); // hours
            }, 0) / withTimestamps.length
          : null;

      // Win rate trend — bucket by week
      const trendBuckets = new Map<
        string,
        { total: number; won: number }
      >();

      for (const p of decided) {
        const date = new Date(p.created_at as string);
        const weekStart = new Date(date);
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        const key = weekStart.toISOString().split('T')[0] ?? '';
        const existing = trendBuckets.get(key) ?? { total: 0, won: 0 };
        existing.total += 1;
        if (p.outcome === 'won') existing.won += 1;
        trendBuckets.set(key, existing);
      }

      const winRateTrend = Array.from(trendBuckets.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, { total, won: wonCount }]) => ({
          date,
          winRate: total > 0 ? wonCount / total : 0,
          count: total,
        }));

      return {
        totalProposals: proposals.length,
        winRate,
        avgDealValue,
        avgTimeToDecision,
        winRateTrend,
      };
    }),

  sectionPerformance: protectedProcedure
    .input(
      z.object({
        orgId: z.string().uuid(),
        period: PeriodSchema,
      }),
    )
    .query(async ({ ctx, input }) => {
      const periodStart = getPeriodStart(input.period);

      // Get proposals in period with outcome
      const { data: proposals } = await ctx.supabase
        .from('proposals')
        .select('id, outcome')
        .eq('org_id', input.orgId)
        .gte('created_at', periodStart.toISOString())
        .not('outcome', 'is', null);

      if (!proposals || proposals.length === 0) {
        return { sections: [] };
      }

      const proposalIds = proposals.map((p) => p.id as string);
      const wonIds = new Set(
        proposals.filter((p) => p.outcome === 'won').map((p) => p.id as string),
      );

      // Get section read events
      const { data: events } = await ctx.supabase
        .from('tracking_events')
        .select('proposal_id, section_id, duration_ms, proposal_sections(name)')
        .in('proposal_id', proposalIds)
        .eq('event_type', 'section_exit')
        .not('section_id', 'is', null)
        .not('duration_ms', 'is', null);

      if (!events || events.length === 0) {
        return { sections: [] };
      }

      // Aggregate by section name
      const sectionStats = new Map<
        string,
        { totalMs: number; count: number; wonMs: number; wonCount: number }
      >();

      for (const event of events) {
        const sectionData = Array.isArray(event.proposal_sections)
          ? event.proposal_sections[0]
          : event.proposal_sections;
        const sectionName = (sectionData as Record<string, unknown> | null)?.['name'] as string | undefined;
        if (!sectionName) continue;

        const existing = sectionStats.get(sectionName) ?? {
          totalMs: 0,
          count: 0,
          wonMs: 0,
          wonCount: 0,
        };
        existing.totalMs += event.duration_ms as number;
        existing.count += 1;
        if (wonIds.has(event.proposal_id as string)) {
          existing.wonMs += event.duration_ms as number;
          existing.wonCount += 1;
        }
        sectionStats.set(sectionName, existing);
      }

      return {
        sections: Array.from(sectionStats.entries()).map(
          ([sectionName, stats]) => ({
            sectionName,
            avgReadTimeMs:
              stats.count > 0 ? stats.totalMs / stats.count : 0,
            avgReadTimeWon:
              stats.wonCount > 0 ? stats.wonMs / stats.wonCount : 0,
            avgReadTimeAll:
              stats.count > 0 ? stats.totalMs / stats.count : 0,
            winCorrelation:
              stats.wonCount > 0 && stats.count > 0
                ? stats.wonCount / stats.count - 0.5
                : 0,
          }),
        ),
      };
    }),

  pricingInsights: protectedProcedure
    .input(z.object({ orgId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { data: proposals } = await ctx.supabase
        .from('proposals')
        .select('outcome, deal_value')
        .eq('org_id', input.orgId)
        .not('outcome', 'is', null)
        .not('deal_value', 'is', null);

      if (!proposals || proposals.length === 0) {
        return {
          winRateByDealBucket: [],
          avgWinningDealValue: null,
          avgLosingDealValue: null,
        };
      }

      const buckets: Record<string, { total: number; won: number }> = {
        '$0-5K': { total: 0, won: 0 },
        '$5K-15K': { total: 0, won: 0 },
        '$15K-50K': { total: 0, won: 0 },
        '$50K-100K': { total: 0, won: 0 },
        '$100K+': { total: 0, won: 0 },
      };

      const wonValues: number[] = [];
      const lostValues: number[] = [];

      for (const p of proposals) {
        const value = p.deal_value as number;
        const outcome = p.outcome as string;

        if (outcome === 'won') wonValues.push(value);
        else lostValues.push(value);

        let bucket: string;
        if (value < 5000) bucket = '$0-5K';
        else if (value < 15000) bucket = '$5K-15K';
        else if (value < 50000) bucket = '$15K-50K';
        else if (value < 100000) bucket = '$50K-100K';
        else bucket = '$100K+';

        const b = buckets[bucket];
        if (b) {
          b.total += 1;
          if (outcome === 'won') b.won += 1;
        }
      }

      return {
        winRateByDealBucket: Object.entries(buckets)
          .filter(([, { total }]) => total > 0)
          .map(([bucket, { total, won }]) => ({
            bucket,
            winRate: total > 0 ? won / total : 0,
            count: total,
          })),
        avgWinningDealValue:
          wonValues.length > 0
            ? wonValues.reduce((a, b) => a + b, 0) / wonValues.length
            : null,
        avgLosingDealValue:
          lostValues.length > 0
            ? lostValues.reduce((a, b) => a + b, 0) / lostValues.length
            : null,
      };
    }),

  proposalTracking: protectedProcedure
    .input(z.object({ proposalId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { data: events } = await ctx.supabase
        .from('tracking_events')
        .select(
          'id, event_type, section_id, duration_ms, link_url, ip_hash, occurred_at, proposal_sections(name)',
        )
        .eq('proposal_id', input.proposalId)
        .order('occurred_at');

      if (!events) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch tracking events',
        });
      }

      const openEvents = events.filter((e) => e.event_type === 'open');
      const uniqueOpens = new Set(events.filter(e => e.event_type === 'open').map(e => e.ip_hash)).size;
      const lastOpened =
        openEvents.length > 0
          ? openEvents[openEvents.length - 1]?.occurred_at ?? null
          : null;

      // Section engagement
      const sectionStats = new Map<
        string,
        { sectionId: string; sectionName: string; totalMs: number; visits: number }
      >();

      for (const e of events) {
        if (e.event_type === 'section_exit' && e.section_id && e.duration_ms) {
          const sectionData = Array.isArray(e.proposal_sections)
            ? e.proposal_sections[0]
            : e.proposal_sections;
          const name = (sectionData as Record<string, unknown> | null)?.['name'] as string | undefined;
          const existing = sectionStats.get(e.section_id as string) ?? {
            sectionId: e.section_id as string,
            sectionName: name ?? 'Unknown',
            totalMs: 0,
            visits: 0,
          };
          existing.totalMs += e.duration_ms as number;
          existing.visits += 1;
          sectionStats.set(e.section_id as string, existing);
        }
      }

      // Link clicks
      const linkClicks = new Map<string, number>();
      for (const e of events) {
        if (e.event_type === 'link_click' && e.link_url) {
          linkClicks.set(
            e.link_url as string,
            (linkClicks.get(e.link_url as string) ?? 0) + 1,
          );
        }
      }

      return {
        totalOpens: openEvents.length,
        uniqueOpens,
        lastOpenedAt: lastOpened as string | null,
        sectionEngagement: Array.from(sectionStats.values()).map((s) => ({
          sectionId: s.sectionId,
          sectionName: s.sectionName,
          totalReadTimeMs: s.totalMs,
          visitCount: s.visits,
        })),
        linkClicks: Array.from(linkClicks.entries()).map(([url, count]) => ({
          url,
          count,
        })),
        timeline: events.map((e) => ({
          eventType: e.event_type as TrackingEventType,
          occurredAt: e.occurred_at as string,
        })),
      };
    }),
});

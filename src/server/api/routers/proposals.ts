import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { createTRPCRouter, protectedProcedure } from '@/server/trpc';
import { createId } from '@paralleldrive/cuid2';
import type { ProposalContent, ProposalOutcome, ProposalStatus } from '@/types/domain';

const ProposalContentSchema = z.object({
  sections: z.array(
    z.object({
      id: z.string(),
      templateSectionId: z.string().nullable(),
      name: z.string(),
      content: z.string(),
      order: z.number().int().min(0),
    }),
  ),
  variables: z.record(z.string(), z.string()),
  coverImage: z.string().optional(),
  brandColor: z.string().optional(),
  footer: z.string().optional(),
});

const CreateProposalSchema = z.object({
  orgId: z.string().uuid(),
  title: z.string().min(1).max(255),
  clientName: z.string().min(1).max(150),
  clientEmail: z.string().email(),
  clientCompany: z.string().max(150).optional(),
  dealValue: z.number().positive().optional(),
  industry: z.string().max(100).optional(),
  templateId: z.string().uuid().optional(),
  content: ProposalContentSchema,
});

const UpdateProposalSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(255).optional(),
  clientName: z.string().min(1).max(150).optional(),
  clientEmail: z.string().email().optional(),
  clientCompany: z.string().max(150).nullable().optional(),
  dealValue: z.number().positive().nullable().optional(),
  industry: z.string().max(100).nullable().optional(),
  content: ProposalContentSchema.optional(),
});

export const proposalsRouter = createTRPCRouter({
  list: protectedProcedure
    .input(
      z.object({
        orgId: z.string().uuid(),
        status: z
          .enum(['draft', 'sent', 'opened', 'won', 'lost', 'expired'])
          .optional(),
        page: z.number().int().min(1).default(1),
        limit: z.number().int().min(1).max(100).default(20),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { orgId, status, page, limit } = input;
      const offset = (page - 1) * limit;

      let query = ctx.supabase
        .from('proposals')
        .select(
          'id, slug, title, client_name, client_company, deal_value, industry, status, outcome, sent_at, first_opened_at, created_at',
          { count: 'exact' },
        )
        .eq('org_id', orgId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error, count } = await query;

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch proposals',
          cause: error,
        });
      }

      return {
        proposals: (data ?? []).map((p) => ({
          id: p.id as string,
          slug: p.slug as string,
          title: p.title as string,
          clientName: p.client_name as string,
          clientCompany: p.client_company as string | null,
          dealValue: p.deal_value as number | null,
          industry: p.industry as string | null,
          status: p.status as ProposalStatus,
          outcome: p.outcome as ProposalOutcome | null,
          sentAt: p.sent_at as string | null,
          firstOpenedAt: p.first_opened_at as string | null,
          createdAt: p.created_at as string,
        })),
        meta: {
          page,
          limit,
          total: count ?? 0,
        },
      };
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { data: proposal, error } = await ctx.supabase
        .from('proposals')
        .select('*')
        .eq('id', input.id)
        .single();

      if (error ?? !proposal) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Proposal not found' });
      }

      const { data: sections } = await ctx.supabase
        .from('proposal_sections')
        .select('id, name, order_index, word_count')
        .eq('proposal_id', input.id)
        .order('order_index');

      return {
        id: proposal.id as string,
        slug: proposal.slug as string,
        title: proposal.title as string,
        clientName: proposal.client_name as string,
        clientEmail: proposal.client_email as string,
        clientCompany: proposal.client_company as string | null,
        dealValue: proposal.deal_value as number | null,
        industry: proposal.industry as string | null,
        status: proposal.status as ProposalStatus,
        outcome: proposal.outcome as ProposalOutcome | null,
        outcomeReason: proposal.outcome_reason as string | null,
        content: proposal.content as ProposalContent,
        templateId: proposal.template_id as string | null,
        sentAt: proposal.sent_at as string | null,
        firstOpenedAt: proposal.first_opened_at as string | null,
        expiresAt: proposal.expires_at as string | null,
        sections: (sections ?? []).map((s) => ({
          id: s.id as string,
          name: s.name as string,
          orderIndex: s.order_index as number,
          wordCount: s.word_count as number,
        })),
        createdAt: proposal.created_at as string,
        updatedAt: proposal.updated_at as string,
      };
    }),

  create: protectedProcedure
    .input(CreateProposalSchema)
    .mutation(async ({ ctx, input }) => {
      const slug = createId();

      const { data, error } = await ctx.supabase
        .from('proposals')
        .insert({
          slug,
          org_id: input.orgId,
          creator_id: ctx.user.id,
          template_id: input.templateId ?? null,
          title: input.title,
          client_name: input.clientName,
          client_email: input.clientEmail,
          client_company: input.clientCompany ?? null,
          deal_value: input.dealValue ?? null,
          industry: input.industry ?? null,
          content: input.content,
          status: 'draft',
        })
        .select('id, slug, status, created_at')
        .single();

      if (error ?? !data) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create proposal',
          cause: error,
        });
      }

      // Sync proposal sections for analytics
      if (input.content.sections.length > 0) {
        await ctx.supabase.from('proposal_sections').insert(
          input.content.sections.map((s) => ({
            proposal_id: data.id as string,
            name: s.name,
            order_index: s.order,
            word_count: s.content.split(/\s+/).filter(Boolean).length,
          })),
        );
      }

      return {
        id: data.id as string,
        slug: data.slug as string,
        status: 'draft' as const,
        createdAt: data.created_at as string,
      };
    }),

  update: protectedProcedure
    .input(UpdateProposalSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, content, ...rest } = input;

      const updates: Record<string, unknown> = {};
      if (rest.title !== undefined) updates['title'] = rest.title;
      if (rest.clientName !== undefined) updates['client_name'] = rest.clientName;
      if (rest.clientEmail !== undefined) updates['client_email'] = rest.clientEmail;
      if (rest.clientCompany !== undefined) updates['client_company'] = rest.clientCompany;
      if (rest.dealValue !== undefined) updates['deal_value'] = rest.dealValue;
      if (rest.industry !== undefined) updates['industry'] = rest.industry;
      if (content !== undefined) updates['content'] = content;

      const { data, error } = await ctx.supabase
        .from('proposals')
        .update(updates)
        .eq('id', id)
        .select('id, updated_at')
        .single();

      if (error ?? !data) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update proposal',
          cause: error,
        });
      }

      // Re-sync sections if content was updated
      if (content?.sections) {
        await ctx.supabase
          .from('proposal_sections')
          .delete()
          .eq('proposal_id', id);

        if (content.sections.length > 0) {
          await ctx.supabase.from('proposal_sections').insert(
            content.sections.map((s) => ({
              proposal_id: id,
              name: s.name,
              order_index: s.order,
              word_count: s.content.split(/\s+/).filter(Boolean).length,
            })),
          );
        }
      }

      return {
        id: data.id as string,
        updatedAt: data.updated_at as string,
      };
    }),

  send: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        emailSubject: z.string().max(255).optional(),
        emailMessage: z.string().max(2000).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Fetch proposal and verify it's in draft status
      const { data: proposal, error: fetchError } = await ctx.supabase
        .from('proposals')
        .select('id, slug, status, org_id, title, client_email, client_name')
        .eq('id', input.id)
        .single();

      if (fetchError ?? !proposal) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Proposal not found' });
      }

      if (proposal.status !== 'draft') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `Cannot send a proposal with status "${proposal.status as string}"`,
        });
      }

      // Check org subscription is active
      const { data: subscription } = await ctx.supabase
        .from('subscriptions')
        .select('status')
        .eq('org_id', proposal.org_id as string)
        .single();

      if (subscription && !['active', 'trialing'].includes(subscription.status as string)) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Your subscription is not active. Please update billing.',
        });
      }

      const now = new Date();
      const expiresAt = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

      const { data: updated, error: updateError } = await ctx.supabase
        .from('proposals')
        .update({
          status: 'sent',
          sent_at: now.toISOString(),
          expires_at: expiresAt.toISOString(),
        })
        .eq('id', input.id)
        .select('id, slug, status, sent_at')
        .single();

      if (updateError ?? !updated) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to send proposal',
          cause: updateError,
        });
      }

      const appUrl = process.env['NEXT_PUBLIC_APP_URL'] ?? 'http://localhost:3000';
      const publicUrl = `${appUrl}/p/${updated.slug as string}`;

      // TODO: Send email via Resend (M3 implementation)

      return {
        id: updated.id as string,
        slug: updated.slug as string,
        status: 'sent' as const,
        sentAt: updated.sent_at as string,
        publicUrl,
      };
    }),

  markOutcome: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        outcome: z.enum(['won', 'lost']),
        reason: z.string().max(2000).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from('proposals')
        .update({
          outcome: input.outcome,
          outcome_reason: input.reason ?? null,
          status: input.outcome,
        })
        .eq('id', input.id)
        .select('id, outcome, updated_at')
        .single();

      if (error ?? !data) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to mark outcome',
          cause: error,
        });
      }

      return {
        id: data.id as string,
        outcome: data.outcome as ProposalOutcome,
        updatedAt: data.updated_at as string,
      };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { error } = await ctx.supabase
        .from('proposals')
        .delete()
        .eq('id', input.id);

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete proposal',
          cause: error,
        });
      }

      return { success: true as const };
    }),
});

import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { createTRPCRouter, protectedProcedure } from '@/server/trpc';

const TemplateSectionInputSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1).max(150),
  orderIndex: z.number().int().min(0).max(99),
  aiPrompt: z.string().optional(),
  defaultContent: z.string().optional(),
  variables: z.array(z.string()).max(20).default([]),
});

export const templatesRouter = createTRPCRouter({
  list: protectedProcedure
    .input(z.object({ orgId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from('templates')
        .select(
          'id, name, description, industry, is_system, created_at, template_sections(id)',
        )
        .or(`org_id.eq.${input.orgId},is_system.eq.true`)
        .order('is_system', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch templates',
          cause: error,
        });
      }

      return {
        templates: (data ?? []).map((t) => ({
          id: t.id as string,
          name: t.name as string,
          description: t.description as string | null,
          industry: t.industry as string | null,
          isSystem: t.is_system as boolean,
          sectionCount: Array.isArray(t.template_sections)
            ? t.template_sections.length
            : 0,
          createdAt: t.created_at as string,
        })),
      };
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { data: template, error } = await ctx.supabase
        .from('templates')
        .select(
          'id, name, description, is_system, template_sections(id, name, order_index, ai_prompt, default_content, variables)',
        )
        .eq('id', input.id)
        .single();

      if (error ?? !template) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Template not found' });
      }

      const sections = Array.isArray(template.template_sections)
        ? template.template_sections
        : [];

      return {
        id: template.id as string,
        name: template.name as string,
        description: template.description as string | null,
        isSystem: template.is_system as boolean,
        sections: sections
          .sort(
            (a: Record<string, unknown>, b: Record<string, unknown>) =>
              (a['order_index'] as number) - (b['order_index'] as number),
          )
          .map((s: Record<string, unknown>) => ({
            id: s['id'] as string,
            name: s['name'] as string,
            orderIndex: s['order_index'] as number,
            aiPrompt: s['ai_prompt'] as string | null,
            defaultContent: s['default_content'] as string | null,
            variables: (s['variables'] as string[]) ?? [],
          })),
      };
    }),

  create: protectedProcedure
    .input(
      z.object({
        orgId: z.string().uuid(),
        name: z.string().min(1).max(150),
        description: z.string().optional(),
        industry: z.string().max(100).optional(),
        sections: z.array(TemplateSectionInputSchema),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { data: template, error } = await ctx.supabase
        .from('templates')
        .insert({
          org_id: input.orgId,
          name: input.name,
          description: input.description ?? null,
          industry: input.industry ?? null,
          is_system: false,
          created_by: ctx.user.id,
        })
        .select('id, created_at')
        .single();

      if (error ?? !template) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create template',
          cause: error,
        });
      }

      if (input.sections.length > 0) {
        const { error: sectionsError } = await ctx.supabase
          .from('template_sections')
          .insert(
            input.sections.map((s) => ({
              template_id: template.id as string,
              name: s.name,
              order_index: s.orderIndex,
              ai_prompt: s.aiPrompt ?? null,
              default_content: s.defaultContent ?? null,
              variables: s.variables,
            })),
          );

        if (sectionsError) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to create template sections',
            cause: sectionsError,
          });
        }
      }

      return {
        id: template.id as string,
        createdAt: template.created_at as string,
      };
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        name: z.string().min(1).max(150).optional(),
        description: z.string().nullable().optional(),
        industry: z.string().max(100).nullable().optional(),
        sections: z.array(TemplateSectionInputSchema).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, sections, ...rest } = input;

      // Ensure not a system template
      const { data: existing } = await ctx.supabase
        .from('templates')
        .select('is_system')
        .eq('id', id)
        .single();

      if (existing?.is_system) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Cannot modify system templates',
        });
      }

      const updates: Record<string, unknown> = {};
      if (rest.name !== undefined) updates['name'] = rest.name;
      if (rest.description !== undefined) updates['description'] = rest.description;
      if (rest.industry !== undefined) updates['industry'] = rest.industry;

      const { data, error } = await ctx.supabase
        .from('templates')
        .update(updates)
        .eq('id', id)
        .select('id, updated_at')
        .single();

      if (error ?? !data) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update template',
          cause: error,
        });
      }

      if (sections !== undefined) {
        await ctx.supabase.from('template_sections').delete().eq('template_id', id);
        if (sections.length > 0) {
          await ctx.supabase.from('template_sections').insert(
            sections.map((s) => ({
              template_id: id,
              name: s.name,
              order_index: s.orderIndex,
              ai_prompt: s.aiPrompt ?? null,
              default_content: s.defaultContent ?? null,
              variables: s.variables,
            })),
          );
        }
      }

      return {
        id: data.id as string,
        updatedAt: data.updated_at as string,
      };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      // Cannot delete system templates
      const { data: template } = await ctx.supabase
        .from('templates')
        .select('is_system')
        .eq('id', input.id)
        .single();

      if (template?.is_system) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Cannot delete system templates',
        });
      }

      // Cannot delete templates with proposals
      const { count } = await ctx.supabase
        .from('proposals')
        .select('id', { count: 'exact', head: true })
        .eq('template_id', input.id);

      if ((count ?? 0) > 0) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Cannot delete a template with existing proposals',
        });
      }

      const { error } = await ctx.supabase
        .from('templates')
        .delete()
        .eq('id', input.id);

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete template',
          cause: error,
        });
      }

      return { success: true as const };
    }),
});

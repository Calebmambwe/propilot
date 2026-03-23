import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { createTRPCRouter, protectedProcedure } from '@/server/trpc';
import { slugify } from '@/lib/utils';
import type { MemberRole, OrgPlan } from '@/types/domain';

const PLAN_MEMBER_LIMITS: Record<OrgPlan, number> = {
  solo: 1,
  team: 5,
  agency: 25,
};

export const organizationsRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(2).max(150),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const slug = slugify(input.name);

      const { data: org, error } = await ctx.supabase
        .from('organizations')
        .insert({
          name: input.name,
          slug,
          plan: 'solo',
          white_label: false,
        })
        .select('id, name, slug, plan, created_at')
        .single();

      if (error ?? !org) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create organization',
          cause: error,
        });
      }

      // Add creator as owner
      await ctx.supabase.from('organization_members').insert({
        org_id: org.id as string,
        user_id: ctx.user.id,
        role: 'owner',
      });

      return {
        id: org.id as string,
        name: org.name as string,
        slug: org.slug as string,
        plan: org.plan as OrgPlan,
        createdAt: org.created_at as string,
      };
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        name: z.string().min(2).max(150).optional(),
        whiteLabel: z.boolean().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const updates: Record<string, unknown> = {};
      if (input.name !== undefined) updates['name'] = input.name;
      if (input.whiteLabel !== undefined) updates['white_label'] = input.whiteLabel;

      const { data, error } = await ctx.supabase
        .from('organizations')
        .update(updates)
        .eq('id', input.id)
        .select('id, updated_at')
        .single();

      if (error ?? !data) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update organization',
          cause: error,
        });
      }

      return {
        id: data.id as string,
        updatedAt: data.updated_at as string,
      };
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from('organizations')
        .select('id, name, slug, plan, white_label, created_at, updated_at')
        .eq('id', input.id)
        .single();

      if (error ?? !data) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Organization not found' });
      }

      return {
        id: data.id as string,
        name: data.name as string,
        slug: data.slug as string,
        plan: data.plan as OrgPlan,
        whiteLabel: data.white_label as boolean,
        createdAt: data.created_at as string,
        updatedAt: data.updated_at as string,
      };
    }),

  listMembers: protectedProcedure
    .input(z.object({ orgId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from('organization_members')
        .select('id, user_id, role, joined_at, users(email, full_name, avatar_url)')
        .eq('org_id', input.orgId)
        .order('joined_at');

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch members',
          cause: error,
        });
      }

      return {
        members: (data ?? []).map((m) => {
          const user = Array.isArray(m.users) ? m.users[0] : m.users;
          return {
            id: m.id as string,
            userId: m.user_id as string,
            role: m.role as MemberRole,
            joinedAt: m.joined_at as string,
            email: user?.email as string | undefined,
            fullName: user?.full_name as string | undefined,
            avatarUrl: user?.avatar_url as string | null | undefined,
          };
        }),
      };
    }),

  inviteMember: protectedProcedure
    .input(
      z.object({
        orgId: z.string().uuid(),
        email: z.string().email(),
        role: z.enum(['admin', 'member']).default('member'),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Check plan limits
      const { data: org } = await ctx.supabase
        .from('organizations')
        .select('plan')
        .eq('id', input.orgId)
        .single();

      const { count: currentCount } = await ctx.supabase
        .from('organization_members')
        .select('id', { count: 'exact', head: true })
        .eq('org_id', input.orgId);

      const plan = (org?.plan as OrgPlan) ?? 'solo';
      const limit = PLAN_MEMBER_LIMITS[plan];

      if ((currentCount ?? 0) >= limit) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: `Your plan supports up to ${limit} users. Upgrade to add more.`,
        });
      }

      // Find user by email
      const { data: targetUser } = await ctx.supabase
        .from('users')
        .select('id')
        .eq('email', input.email)
        .single();

      if (!targetUser) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'No user found with that email address',
        });
      }

      const { error } = await ctx.supabase.from('organization_members').insert({
        org_id: input.orgId,
        user_id: targetUser.id as string,
        role: input.role,
        invited_by: ctx.user.id,
      });

      if (error) {
        if (error.code === '23505') {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'This user is already a member of your organization',
          });
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to invite member',
          cause: error,
        });
      }

      return { success: true as const };
    }),

  removeMember: protectedProcedure
    .input(
      z.object({
        orgId: z.string().uuid(),
        memberId: z.string().uuid(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Cannot remove the last owner
      const { data: member } = await ctx.supabase
        .from('organization_members')
        .select('role, user_id')
        .eq('id', input.memberId)
        .single();

      if (member?.role === 'owner') {
        const { count } = await ctx.supabase
          .from('organization_members')
          .select('id', { count: 'exact', head: true })
          .eq('org_id', input.orgId)
          .eq('role', 'owner');

        if ((count ?? 0) <= 1) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Cannot remove the last owner of an organization',
          });
        }
      }

      const { error } = await ctx.supabase
        .from('organization_members')
        .delete()
        .eq('id', input.memberId);

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to remove member',
          cause: error,
        });
      }

      return { success: true as const };
    }),
});

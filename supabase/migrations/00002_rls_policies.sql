-- ProPilot RLS Policies Migration
-- Row-Level Security policies for all org-owned tables

-- ============================================================
-- users
-- ============================================================

CREATE POLICY "users_select_own"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "users_update_own"
  ON public.users FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "users_insert_own"
  ON public.users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================================
-- organizations
-- ============================================================

-- Users can read orgs they belong to
CREATE POLICY "org_members_can_read_org"
  ON public.organizations FOR SELECT
  USING (
    id IN (
      SELECT org_id FROM public.organization_members
      WHERE user_id = auth.uid()
    )
  );

-- Only org owners/admins can update org
CREATE POLICY "org_owners_can_update_org"
  ON public.organizations FOR UPDATE
  USING (
    id IN (
      SELECT org_id FROM public.organization_members
      WHERE user_id = auth.uid()
        AND role IN ('owner', 'admin')
    )
  )
  WITH CHECK (
    id IN (
      SELECT org_id FROM public.organization_members
      WHERE user_id = auth.uid()
        AND role IN ('owner', 'admin')
    )
  );

-- Authenticated users can create orgs (they become owner)
CREATE POLICY "authenticated_users_can_create_org"
  ON public.organizations FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================================
-- organization_members
-- ============================================================

CREATE POLICY "org_members_can_read_members"
  ON public.organization_members FOR SELECT
  USING (
    org_id IN (
      SELECT org_id FROM public.organization_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "org_owners_can_insert_members"
  ON public.organization_members FOR INSERT
  WITH CHECK (
    org_id IN (
      SELECT org_id FROM public.organization_members
      WHERE user_id = auth.uid()
        AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY "org_owners_can_delete_members"
  ON public.organization_members FOR DELETE
  USING (
    org_id IN (
      SELECT org_id FROM public.organization_members
      WHERE user_id = auth.uid()
        AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY "org_owners_can_update_member_roles"
  ON public.organization_members FOR UPDATE
  USING (
    org_id IN (
      SELECT org_id FROM public.organization_members
      WHERE user_id = auth.uid()
        AND role IN ('owner', 'admin')
    )
  )
  WITH CHECK (
    org_id IN (
      SELECT org_id FROM public.organization_members
      WHERE user_id = auth.uid()
        AND role IN ('owner', 'admin')
    )
  );

-- ============================================================
-- subscriptions
-- ============================================================

CREATE POLICY "org_members_can_read_subscription"
  ON public.subscriptions FOR SELECT
  USING (
    org_id IN (
      SELECT org_id FROM public.organization_members
      WHERE user_id = auth.uid()
    )
  );

-- Subscriptions are managed server-side via service role (Stripe webhooks)
-- No direct insert/update/delete from client

-- ============================================================
-- templates
-- ============================================================

-- Users can read system templates and their org's templates
CREATE POLICY "org_members_can_read_templates"
  ON public.templates FOR SELECT
  USING (
    is_system = TRUE
    OR org_id IN (
      SELECT org_id FROM public.organization_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "org_members_can_create_templates"
  ON public.templates FOR INSERT
  WITH CHECK (
    org_id IN (
      SELECT org_id FROM public.organization_members
      WHERE user_id = auth.uid()
    )
    AND is_system = FALSE
  );

CREATE POLICY "org_members_can_update_templates"
  ON public.templates FOR UPDATE
  USING (
    org_id IN (
      SELECT org_id FROM public.organization_members
      WHERE user_id = auth.uid()
    )
    AND is_system = FALSE
  )
  WITH CHECK (
    org_id IN (
      SELECT org_id FROM public.organization_members
      WHERE user_id = auth.uid()
    )
    AND is_system = FALSE
  );

CREATE POLICY "org_members_can_delete_templates"
  ON public.templates FOR DELETE
  USING (
    org_id IN (
      SELECT org_id FROM public.organization_members
      WHERE user_id = auth.uid()
    )
    AND is_system = FALSE
  );

-- ============================================================
-- template_sections
-- ============================================================

CREATE POLICY "org_members_can_read_template_sections"
  ON public.template_sections FOR SELECT
  USING (
    template_id IN (
      SELECT t.id FROM public.templates t
      WHERE t.is_system = TRUE
        OR t.org_id IN (
          SELECT org_id FROM public.organization_members
          WHERE user_id = auth.uid()
        )
    )
  );

CREATE POLICY "org_members_can_manage_template_sections"
  ON public.template_sections FOR ALL
  USING (
    template_id IN (
      SELECT t.id FROM public.templates t
      WHERE t.org_id IN (
        SELECT org_id FROM public.organization_members
        WHERE user_id = auth.uid()
      )
      AND t.is_system = FALSE
    )
  )
  WITH CHECK (
    template_id IN (
      SELECT t.id FROM public.templates t
      WHERE t.org_id IN (
        SELECT org_id FROM public.organization_members
        WHERE user_id = auth.uid()
      )
      AND t.is_system = FALSE
    )
  );

-- ============================================================
-- proposals
-- ============================================================

CREATE POLICY "org_members_can_read_proposals"
  ON public.proposals FOR SELECT
  USING (
    org_id IN (
      SELECT org_id FROM public.organization_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "org_members_can_create_proposals"
  ON public.proposals FOR INSERT
  WITH CHECK (
    org_id IN (
      SELECT org_id FROM public.organization_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "org_members_can_update_proposals"
  ON public.proposals FOR UPDATE
  USING (
    org_id IN (
      SELECT org_id FROM public.organization_members
      WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    org_id IN (
      SELECT org_id FROM public.organization_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "org_members_can_delete_proposals"
  ON public.proposals FOR DELETE
  USING (
    org_id IN (
      SELECT org_id FROM public.organization_members
      WHERE user_id = auth.uid()
    )
  );

-- Public can read sent/opened proposals by slug (for /p/[slug] route)
-- This is handled via the service role in the route handler, not via RLS

-- ============================================================
-- proposal_sections
-- ============================================================

CREATE POLICY "org_members_can_read_proposal_sections"
  ON public.proposal_sections FOR SELECT
  USING (
    proposal_id IN (
      SELECT p.id FROM public.proposals p
      WHERE p.org_id IN (
        SELECT org_id FROM public.organization_members
        WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "org_members_can_manage_proposal_sections"
  ON public.proposal_sections FOR ALL
  USING (
    proposal_id IN (
      SELECT p.id FROM public.proposals p
      WHERE p.org_id IN (
        SELECT org_id FROM public.organization_members
        WHERE user_id = auth.uid()
      )
    )
  )
  WITH CHECK (
    proposal_id IN (
      SELECT p.id FROM public.proposals p
      WHERE p.org_id IN (
        SELECT org_id FROM public.organization_members
        WHERE user_id = auth.uid()
      )
    )
  );

-- ============================================================
-- tracking_events
-- ============================================================

-- Public can INSERT (tracking pixel, frontend script — no auth required)
CREATE POLICY "public_can_insert_tracking_events"
  ON public.tracking_events FOR INSERT
  WITH CHECK (TRUE);

-- Only org members can SELECT their proposal's events
CREATE POLICY "org_members_can_read_tracking_events"
  ON public.tracking_events FOR SELECT
  USING (
    proposal_id IN (
      SELECT p.id FROM public.proposals p
      WHERE p.org_id IN (
        SELECT org_id FROM public.organization_members
        WHERE user_id = auth.uid()
      )
    )
  );

-- ============================================================
-- ai_coaching_logs
-- ============================================================

CREATE POLICY "org_members_can_read_coaching_logs"
  ON public.ai_coaching_logs FOR SELECT
  USING (
    proposal_id IN (
      SELECT p.id FROM public.proposals p
      WHERE p.org_id IN (
        SELECT org_id FROM public.organization_members
        WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "authenticated_users_can_insert_coaching_logs"
  ON public.ai_coaching_logs FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND proposal_id IN (
      SELECT p.id FROM public.proposals p
      WHERE p.org_id IN (
        SELECT org_id FROM public.organization_members
        WHERE user_id = auth.uid()
      )
    )
  );

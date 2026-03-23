-- ProPilot Initial Schema Migration
-- Creates all 10 core tables with full columns, types, constraints, and indexes

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE org_plan AS ENUM ('solo', 'team', 'agency');
CREATE TYPE member_role AS ENUM ('owner', 'admin', 'member');
CREATE TYPE subscription_status AS ENUM ('active', 'past_due', 'canceled', 'trialing', 'incomplete');
CREATE TYPE proposal_status AS ENUM ('draft', 'sent', 'opened', 'won', 'lost', 'expired');
CREATE TYPE proposal_outcome AS ENUM ('won', 'lost');
CREATE TYPE tracking_event_type AS ENUM ('open', 'section_enter', 'section_exit', 'link_click', 'download');

-- ============================================================
-- TABLE: users
-- ============================================================

CREATE TABLE IF NOT EXISTS public.users (
  id          UUID PRIMARY KEY DEFAULT auth.uid(),
  email       VARCHAR(255) UNIQUE NOT NULL,
  full_name   VARCHAR(100) NOT NULL,
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Auto-create user profile on auth signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- TABLE: organizations
-- ============================================================

CREATE TABLE IF NOT EXISTS public.organizations (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         VARCHAR(150) NOT NULL,
  slug         VARCHAR(100) UNIQUE NOT NULL,
  plan         org_plan NOT NULL DEFAULT 'solo',
  white_label  BOOLEAN NOT NULL DEFAULT FALSE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT organizations_slug_format CHECK (slug ~ '^[a-z0-9][a-z0-9-]{1,98}[a-z0-9]$')
);

CREATE TRIGGER organizations_updated_at
  BEFORE UPDATE ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- TABLE: organization_members
-- ============================================================

CREATE TABLE IF NOT EXISTS public.organization_members (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id      UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  role        member_role NOT NULL DEFAULT 'member',
  invited_by  UUID REFERENCES public.users(id) ON DELETE SET NULL,
  joined_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT org_members_org_user_key UNIQUE (org_id, user_id)
);

CREATE INDEX idx_org_members_user_id ON public.organization_members(user_id);
CREATE INDEX idx_org_members_org_id ON public.organization_members(org_id);

-- ============================================================
-- TABLE: subscriptions
-- ============================================================

CREATE TABLE IF NOT EXISTS public.subscriptions (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id                  UUID UNIQUE NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  stripe_customer_id      VARCHAR(255) UNIQUE NOT NULL,
  stripe_subscription_id  VARCHAR(255) UNIQUE,
  plan                    org_plan NOT NULL DEFAULT 'solo',
  status                  subscription_status NOT NULL DEFAULT 'active',
  current_period_end      TIMESTAMPTZ,
  cancel_at_period_end    BOOLEAN NOT NULL DEFAULT FALSE,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- TABLE: templates
-- ============================================================

CREATE TABLE IF NOT EXISTS public.templates (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id       UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  name         VARCHAR(150) NOT NULL,
  description  TEXT,
  industry     VARCHAR(100),
  is_system    BOOLEAN NOT NULL DEFAULT FALSE,
  created_by   UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_templates_org_id ON public.templates(org_id);
CREATE INDEX idx_templates_is_system ON public.templates(is_system) WHERE is_system = TRUE;

CREATE TRIGGER templates_updated_at
  BEFORE UPDATE ON public.templates
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- TABLE: template_sections
-- ============================================================

CREATE TABLE IF NOT EXISTS public.template_sections (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id      UUID NOT NULL REFERENCES public.templates(id) ON DELETE CASCADE,
  name             VARCHAR(150) NOT NULL,
  order_index      SMALLINT NOT NULL,
  ai_prompt        TEXT,
  default_content  TEXT,
  variables        JSONB NOT NULL DEFAULT '[]',
  CONSTRAINT template_sections_order_range CHECK (order_index BETWEEN 0 AND 99)
);

CREATE INDEX idx_template_sections_template_id ON public.template_sections(template_id);

-- ============================================================
-- TABLE: proposals
-- ============================================================

CREATE TABLE IF NOT EXISTS public.proposals (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug              VARCHAR(30) UNIQUE NOT NULL,
  org_id            UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  creator_id        UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  template_id       UUID REFERENCES public.templates(id) ON DELETE SET NULL,
  title             VARCHAR(255) NOT NULL,
  client_name       VARCHAR(150) NOT NULL,
  client_email      VARCHAR(255) NOT NULL,
  client_company    VARCHAR(150),
  deal_value        NUMERIC(12, 2),
  industry          VARCHAR(100),
  status            proposal_status NOT NULL DEFAULT 'draft',
  outcome           proposal_outcome,
  outcome_reason    TEXT,
  stripe_payment_id VARCHAR(255),
  content           JSONB NOT NULL DEFAULT '{}',
  sent_at           TIMESTAMPTZ,
  first_opened_at   TIMESTAMPTZ,
  expires_at        TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_proposals_org_id ON public.proposals(org_id);
CREATE INDEX idx_proposals_status ON public.proposals(org_id, status);
CREATE INDEX idx_proposals_sent_at ON public.proposals(sent_at);
CREATE INDEX idx_proposals_outcome ON public.proposals(org_id, outcome);

CREATE TRIGGER proposals_updated_at
  BEFORE UPDATE ON public.proposals
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- TABLE: proposal_sections
-- ============================================================

CREATE TABLE IF NOT EXISTS public.proposal_sections (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id  UUID NOT NULL REFERENCES public.proposals(id) ON DELETE CASCADE,
  name         VARCHAR(150) NOT NULL,
  order_index  SMALLINT NOT NULL,
  word_count   SMALLINT NOT NULL DEFAULT 0
);

CREATE INDEX idx_proposal_sections_proposal_id ON public.proposal_sections(proposal_id);

-- ============================================================
-- TABLE: tracking_events
-- ============================================================

CREATE TABLE IF NOT EXISTS public.tracking_events (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id      UUID NOT NULL REFERENCES public.proposals(id) ON DELETE CASCADE,
  section_id       UUID REFERENCES public.proposal_sections(id) ON DELETE SET NULL,
  event_type       tracking_event_type NOT NULL,
  duration_ms      INTEGER,
  link_url         TEXT,
  ip_hash          CHAR(64),
  user_agent_hash  CHAR(64),
  occurred_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tracking_events_proposal_id ON public.tracking_events(proposal_id);
CREATE INDEX idx_tracking_events_occurred_at ON public.tracking_events(occurred_at);
CREATE INDEX idx_tracking_events_type_proposal ON public.tracking_events(proposal_id, event_type);

-- ============================================================
-- TABLE: ai_coaching_logs
-- ============================================================

CREATE TABLE IF NOT EXISTS public.ai_coaching_logs (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id       UUID NOT NULL REFERENCES public.proposals(id) ON DELETE CASCADE,
  user_id           UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  context_snapshot  JSONB NOT NULL,
  suggestions       JSONB NOT NULL,
  model             VARCHAR(100) NOT NULL,
  input_tokens      INTEGER,
  output_tokens     INTEGER,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ai_coaching_logs_proposal_id ON public.ai_coaching_logs(proposal_id);
CREATE INDEX idx_ai_coaching_logs_user_id ON public.ai_coaching_logs(user_id);

-- ============================================================
-- Enable RLS on all tables
-- ============================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.template_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proposal_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tracking_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_coaching_logs ENABLE ROW LEVEL SECURITY;

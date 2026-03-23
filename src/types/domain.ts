// ProPilot domain types — single source of truth for all shared TypeScript types

export type ProposalStatus = 'draft' | 'sent' | 'opened' | 'won' | 'lost' | 'expired';
export type ProposalOutcome = 'won' | 'lost';
export type OrgPlan = 'solo' | 'team' | 'agency';
export type MemberRole = 'owner' | 'admin' | 'member';
export type TrackingEventType =
  | 'open'
  | 'section_enter'
  | 'section_exit'
  | 'link_click'
  | 'download';
export type SubscriptionStatus =
  | 'active'
  | 'past_due'
  | 'canceled'
  | 'trialing'
  | 'incomplete';

export interface ProposalSection {
  id: string;
  templateSectionId: string | null;
  name: string;
  content: string; // rich text HTML
  order: number;
}

export interface ProposalContent {
  sections: ProposalSection[];
  variables: Record<string, string>;
  coverImage?: string;
  brandColor?: string;
  footer?: string;
}

export interface CoachingSuggestion {
  section: string;
  type: 'improve' | 'warning' | 'strength';
  message: string;
  evidence: string; // e.g. "Proposals with this pricing format win 67% of the time"
}

// Full entity types returned from the database

export interface User {
  id: string;
  email: string;
  fullName: string;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  plan: OrgPlan;
  whiteLabel: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface OrganizationMember {
  id: string;
  orgId: string;
  userId: string;
  role: MemberRole;
  invitedBy: string | null;
  joinedAt: string;
}

export interface Subscription {
  id: string;
  orgId: string;
  stripeCustomerId: string;
  stripeSubscriptionId: string | null;
  plan: OrgPlan;
  status: SubscriptionStatus;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Template {
  id: string;
  orgId: string | null;
  name: string;
  description: string | null;
  industry: string | null;
  isSystem: boolean;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TemplateSection {
  id: string;
  templateId: string;
  name: string;
  orderIndex: number;
  aiPrompt: string | null;
  defaultContent: string | null;
  variables: string[];
}

export interface Proposal {
  id: string;
  slug: string;
  orgId: string;
  creatorId: string;
  templateId: string | null;
  title: string;
  clientName: string;
  clientEmail: string;
  clientCompany: string | null;
  dealValue: number | null;
  industry: string | null;
  status: ProposalStatus;
  outcome: ProposalOutcome | null;
  outcomeReason: string | null;
  stripePaymentId: string | null;
  content: ProposalContent;
  sentAt: string | null;
  firstOpenedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProposalSectionRecord {
  id: string;
  proposalId: string;
  name: string;
  orderIndex: number;
  wordCount: number;
}

export interface TrackingEvent {
  id: string;
  proposalId: string;
  sectionId: string | null;
  eventType: TrackingEventType;
  durationMs: number | null;
  linkUrl: string | null;
  ipHash: string | null;
  userAgentHash: string | null;
  occurredAt: string;
}

export interface AiCoachingLog {
  id: string;
  proposalId: string;
  userId: string;
  contextSnapshot: Record<string, unknown>;
  suggestions: CoachingSuggestion[];
  model: string;
  inputTokens: number | null;
  outputTokens: number | null;
  createdAt: string;
}

'use client';

import { useState, use } from 'react';
import Link from 'next/link';
import {
  ChevronLeft,
  Save,
  Send,
  Eye,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Clock,
  Lightbulb,
  TrendingUp,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/* ---- Demo data ---- */

const DEMO_SECTIONS = [
  {
    id: 's1',
    name: 'Executive Summary',
    content: `We are excited to present this proposal for your consideration. Our team has carefully reviewed your requirements and we believe we are uniquely positioned to deliver exceptional results that align with your strategic objectives.

This engagement will focus on delivering measurable outcomes through a structured approach combining industry best practices with innovative solutions tailored specifically to your needs.`,
  },
  {
    id: 's2',
    name: 'Problem Statement',
    content: `Based on our discovery conversations, we have identified several key challenges your organization is currently facing:

1. Inefficient manual processes consuming significant team bandwidth
2. Lack of real-time visibility into operational metrics
3. Fragmented tooling creating data silos across departments

These challenges are resulting in delayed decision-making and missed growth opportunities. Addressing them holistically will create a competitive advantage and unlock meaningful efficiency gains.`,
  },
  {
    id: 's3',
    name: 'Our Solution',
    content: `We propose a phased implementation approach designed to deliver quick wins while building toward a comprehensive, scalable solution:

**Phase 1: Foundation (Weeks 1-4)**
Audit existing systems, define success metrics, and establish project governance.

**Phase 2: Implementation (Weeks 5-12)**
Deploy core functionality with weekly iteration cycles and stakeholder reviews.

**Phase 3: Optimization (Weeks 13-16)**
Fine-tune based on performance data and prepare for full production rollout.`,
  },
  {
    id: 's4',
    name: 'Pricing',
    content: `We offer three engagement tiers to match your budget and scope:

| Tier | Scope | Investment |
|------|-------|-----------|
| Starter | Core features, 1 team | $8,500 |
| Growth | Full suite, 3 teams | $15,000 |
| Enterprise | Custom scope, unlimited teams | Custom |

All tiers include 90 days of post-launch support and quarterly business reviews. Payment terms: 50% upfront, 50% on completion.`,
  },
  {
    id: 's5',
    name: 'Timeline',
    content: `**Project kick-off:** Within 5 business days of contract signing

**Key milestones:**
- Week 2: Discovery & requirements sign-off
- Week 6: Alpha delivery for stakeholder review
- Week 10: Beta launch to pilot users
- Week 14: Full production launch
- Week 16: Post-launch optimization complete

We commit to weekly progress updates and maintain a shared project dashboard accessible to your team throughout the engagement.`,
  },
  {
    id: 's6',
    name: 'Terms & Next Steps',
    content: `**Payment Terms:** Net 30 from invoice date. Late payments subject to 1.5% monthly interest.

**Intellectual Property:** All custom work products are assigned to the client upon final payment.

**Confidentiality:** Both parties agree to maintain confidentiality of shared information.

**To proceed:**
1. Review and sign the attached Statement of Work
2. Submit initial payment to initiate project kick-off
3. Schedule onboarding call with our project lead

We look forward to partnering with you on this initiative. Please don't hesitate to reach out with any questions.`,
  },
];

const AI_SUGGESTIONS = [
  {
    id: 'c1',
    type: 'strength' as const,
    section: 'Executive Summary',
    message: 'Strong opening sets clear expectations',
    evidence: 'Proposals with clear executive summaries have 31% higher open-to-read rates.',
  },
  {
    id: 'c2',
    type: 'improve' as const,
    section: 'Pricing',
    message: 'Add interactive pricing toggle',
    evidence: 'Proposals with tiered pricing tables win 2.3x more deals.',
  },
  {
    id: 'c3',
    type: 'warning' as const,
    section: 'Terms & Next Steps',
    message: 'Next steps section could be clearer',
    evidence: '67% of lost deals had vague or missing call-to-action in final section.',
  },
];

const STATUS_CLASSES: Record<string, string> = {
  won: 'status-won',
  sent: 'status-sent',
  viewed: 'status-viewed',
  lost: 'status-lost',
  draft: 'status-draft',
};

type Params = Promise<{ id: string }>;

export default function EditProposalPage({ params }: { params: Params }) {
  const { id } = use(params);

  // Map demo proposal ids to data
  const isDemo = ['1', '2', '3', '4', '5', '6', '7', 't1', 't2', 't3', 'new'].includes(id);

  const DEMO_META = {
    title: id === 'new' ? 'New Proposal' : 'Website Redesign Proposal',
    client: id === 'new' ? 'New Client' : 'Acme Corp',
    status: 'draft',
    value: id === 'new' ? null : 12000,
  };

  const [sections, setSections] = useState(DEMO_SECTIONS);
  const [activeSection, setActiveSection] = useState('s1');
  const [title, setTitle] = useState(DEMO_META.title);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [aiPanelOpen, setAiPanelOpen] = useState(true);

  const currentSection = sections.find((s) => s.id === activeSection) ?? sections[0];

  function handleContentChange(sectionId: string, value: string) {
    setSections((prev) =>
      prev.map((s) => (s.id === sectionId ? { ...s, content: value } : s)),
    );
  }

  async function handleSave() {
    setIsSaving(true);
    // Simulate save delay
    await new Promise((r) => setTimeout(r, 600));
    setIsSaving(false);
    setSavedAt(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  }

  if (!isDemo) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <AlertCircle className="h-10 w-10 text-muted-foreground mb-4" strokeWidth={1.5} />
        <h2 className="text-lg font-semibold text-foreground">Proposal not found</h2>
        <p className="text-sm text-muted-foreground mt-1">
          This proposal doesn&apos;t exist or you don&apos;t have access to it.
        </p>
        <Button variant="outline" size="sm" className="mt-4" asChild>
          <Link href="/proposals">Back to proposals</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full -m-4 sm:-m-6 animate-fade-in">
      {/* ---- Top bar ---- */}
      <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-3 border-b border-border bg-card/80 backdrop-blur-sm shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href="/proposals"
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors duration-150 shrink-0"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            Proposals
          </Link>
          <div className="h-3.5 w-px bg-border" />
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-sm font-semibold text-foreground bg-transparent border-none outline-none focus:ring-0 min-w-0 truncate"
            aria-label="Proposal title"
          />
          <span
            className={cn(
              'inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide shrink-0',
              STATUS_CLASSES[DEMO_META.status] ?? 'status-draft',
            )}
          >
            {DEMO_META.status}
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {savedAt && (
            <span className="hidden sm:flex items-center gap-1 text-[11px] text-muted-foreground">
              <Clock className="h-3 w-3" />
              Saved {savedAt}
            </span>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-1.5 text-xs rounded-lg"
            onClick={() => setAiPanelOpen((v) => !v)}
            aria-pressed={aiPanelOpen}
          >
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span className="hidden sm:inline">AI Coach</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 text-xs rounded-lg"
            asChild
          >
            <Link href={`/p/preview-demo`} target="_blank">
              <Eye className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Preview</span>
            </Link>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 text-xs rounded-lg"
            onClick={handleSave}
            disabled={isSaving}
          >
            <Save className="h-3.5 w-3.5" />
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
          <Button size="sm" className="h-8 gap-1.5 text-xs rounded-lg">
            <Send className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Send</span>
          </Button>
        </div>
      </div>

      {/* ---- Main editor layout ---- */}
      <div className="flex flex-1 overflow-hidden min-h-0">
        {/* Left sidebar: section nav */}
        <div className="w-44 shrink-0 border-r border-border bg-muted/20 flex flex-col overflow-y-auto hidden sm:flex">
          <div className="px-3 py-3 border-b border-border">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Sections
            </p>
          </div>
          <nav className="flex-1 p-2 space-y-0.5">
            {sections.map((section, idx) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={cn(
                  'w-full flex items-center gap-2 rounded-lg px-3 py-2 text-left transition-all duration-150',
                  activeSection === section.id
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted',
                )}
              >
                <span
                  className={cn(
                    'flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[9px] font-bold',
                    activeSection === section.id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted-foreground/20 text-muted-foreground',
                  )}
                >
                  {idx + 1}
                </span>
                <span className="text-xs truncate">{section.name}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Center: editor */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-8 min-w-0">
          <div className="max-w-2xl mx-auto">
            {currentSection && (
              <div key={currentSection.id} className="animate-fade-in">
                <div className="mb-4">
                  <h2 className="text-lg font-bold text-foreground">{currentSection.name}</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Click to edit · Changes auto-save every 30 seconds
                  </p>
                </div>
                <div
                  className={cn(
                    'min-h-48 rounded-xl border border-border bg-card p-4 sm:p-6',
                    'focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background',
                    'transition-all duration-150',
                  )}
                >
                  <textarea
                    className="w-full min-h-48 bg-transparent text-sm text-foreground leading-relaxed resize-none outline-none font-sans"
                    value={currentSection.content}
                    onChange={(e) => handleContentChange(currentSection.id, e.target.value)}
                    aria-label={`Edit ${currentSection.name}`}
                    rows={12}
                  />
                </div>

                {/* Section nav footer */}
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs gap-1.5"
                    disabled={sections.indexOf(currentSection) === 0}
                    onClick={() => {
                      const idx = sections.indexOf(currentSection);
                      const prev = sections[idx - 1]; if (prev) setActiveSection(prev.id);
                    }}
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                    Previous
                  </Button>
                  <span className="text-xs text-muted-foreground">
                    {sections.indexOf(currentSection) + 1} / {sections.length}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs gap-1.5"
                    disabled={sections.indexOf(currentSection) === sections.length - 1}
                    onClick={() => {
                      const idx = sections.indexOf(currentSection);
                      const next = sections[idx + 1]; if (next) setActiveSection(next.id);
                    }}
                  >
                    Next
                    <ChevronLeft className="h-3.5 w-3.5 rotate-180" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right sidebar: AI Coach */}
        {aiPanelOpen && (
          <div className="w-64 shrink-0 border-l border-border bg-card flex flex-col overflow-y-auto hidden lg:flex animate-slide-in-left">
            <div className="px-4 py-3 border-b border-border flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5 text-primary" strokeWidth={1.5} />
              <p className="text-xs font-semibold text-foreground">AI Coach</p>
              <span className="ml-auto flex h-4 w-4 items-center justify-center rounded-full bg-primary/15 text-[10px] font-medium text-primary">
                {AI_SUGGESTIONS.length}
              </span>
            </div>

            <div className="flex-1 p-3 space-y-2.5 overflow-y-auto">
              <p className="text-[10px] text-muted-foreground px-1">
                Based on your proposal content and win-rate data
              </p>

              {AI_SUGGESTIONS.map((s) => (
                <div
                  key={s.id}
                  className={cn(
                    'rounded-lg border p-3 space-y-1.5',
                    s.type === 'strength' && 'border-success/30 bg-success/5',
                    s.type === 'improve' && 'border-primary/30 bg-primary/5',
                    s.type === 'warning' && 'border-secondary/30 bg-secondary/5',
                  )}
                >
                  <div className="flex items-start gap-2">
                    {s.type === 'strength' && (
                      <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0 mt-0.5" strokeWidth={2} />
                    )}
                    {s.type === 'improve' && (
                      <Lightbulb className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" strokeWidth={2} />
                    )}
                    {s.type === 'warning' && (
                      <AlertTriangle className="h-3.5 w-3.5 text-secondary shrink-0 mt-0.5" strokeWidth={2} />
                    )}
                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                        {s.section}
                      </p>
                      <p className="text-xs font-medium text-foreground mt-0.5">{s.message}</p>
                    </div>
                  </div>
                  <p className="text-[10px] text-muted-foreground leading-relaxed flex items-start gap-1">
                    <TrendingUp className="h-2.5 w-2.5 shrink-0 mt-0.5 text-muted-foreground" />
                    {s.evidence}
                  </p>
                </div>
              ))}

              {/* Generate more button */}
              <Button
                variant="outline"
                size="sm"
                className="w-full h-8 text-xs gap-1.5 rounded-lg mt-2"
              >
                <Sparkles className="h-3 w-3" />
                Generate more insights
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

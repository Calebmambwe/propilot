'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  FileText,
  ArrowRight,
  Check,
  Layers,
  Star,
  Sparkles,
  Building2,
  Code2,
  Megaphone,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

const SYSTEM_TEMPLATES = [
  {
    id: 't1',
    name: 'Consulting Proposal',
    description: 'Professional services engagement with scope, timeline, and deliverables.',
    industry: 'Consulting',
    sectionCount: 6,
    isPopular: true,
    icon: Building2,
    gradient: 'from-primary/80 to-primary/40',
  },
  {
    id: 't2',
    name: 'Dev Agency Proposal',
    description: 'Software development project with tech stack, milestones, and tiered pricing.',
    industry: 'Technology',
    sectionCount: 8,
    isPopular: true,
    icon: Code2,
    gradient: 'from-accent/80 to-primary/40',
  },
  {
    id: 't3',
    name: 'Marketing Campaign',
    description: 'Full marketing campaign with strategy, channels, and ROI projections.',
    industry: 'Marketing',
    sectionCount: 7,
    isPopular: false,
    icon: Megaphone,
    gradient: 'from-secondary/80 to-accent/40',
  },
];

interface ClientFormData {
  title: string;
  clientName: string;
  clientEmail: string;
  dealValue: string;
}

function NewProposalContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedTemplate = searchParams.get('template');

  const [step, setStep] = useState<'template' | 'details'>(
    preselectedTemplate && preselectedTemplate !== 'blank' ? 'details' : 'template',
  );
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(
    preselectedTemplate ?? null,
  );
  const [form, setForm] = useState<ClientFormData>({
    title: '',
    clientName: '',
    clientEmail: '',
    dealValue: '',
  });
  const [errors, setErrors] = useState<Partial<ClientFormData>>({});

  function selectTemplate(id: string | null) {
    setSelectedTemplate(id);
    setStep('details');
  }

  function validate(): boolean {
    const next: Partial<ClientFormData> = {};
    if (!form.title.trim()) next.title = 'Title is required';
    if (!form.clientName.trim()) next.clientName = 'Client name is required';
    if (!form.clientEmail.trim()) {
      next.clientEmail = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.clientEmail)) {
      next.clientEmail = 'Enter a valid email';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleCreate() {
    if (!validate()) return;
    const demoId = selectedTemplate ?? 'new';
    router.push(`/proposals/${demoId}/edit`);
  }

  const selectedTemplateData = SYSTEM_TEMPLATES.find((t) => t.id === selectedTemplate);

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      {/* Page header */}
      <div>
        <h1 className="text-xl font-bold text-foreground tracking-tight">New Proposal</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {step === 'template'
            ? 'Choose a template to get started, or start from scratch'
            : 'Fill in client details to create your proposal'}
        </p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span
          className={cn(
            'flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold transition-colors duration-150',
            step === 'template'
              ? 'bg-primary text-primary-foreground'
              : 'bg-success text-success-foreground',
          )}
        >
          {step === 'template' ? '1' : <Check className="h-3 w-3" />}
        </span>
        <span className={cn(step === 'template' ? 'text-foreground font-medium' : 'text-muted-foreground')}>
          Choose template
        </span>
        <div className="h-px w-6 bg-border" />
        <span
          className={cn(
            'flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold',
            step === 'details' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground',
          )}
        >
          2
        </span>
        <span className={cn(step === 'details' ? 'text-foreground font-medium' : 'text-muted-foreground')}>
          Client details
        </span>
      </div>

      {/* Step 1: Template selection */}
      {step === 'template' && (
        <div className="space-y-4 animate-fade-in-up">
          {/* Start from scratch */}
          <button
            onClick={() => selectTemplate(null)}
            className={cn(
              'w-full flex items-center gap-4 rounded-xl border border-dashed border-border bg-card p-4',
              'hover:border-primary/50 hover:bg-primary/5 transition-all duration-200 text-left group',
            )}
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted group-hover:bg-primary/10 transition-colors duration-150">
              <FileText className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors duration-150" strokeWidth={1.5} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground">Start from scratch</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Build a custom proposal with no predefined structure
              </p>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all duration-150 shrink-0" />
          </button>

          {/* System templates */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              ProPilot Templates
            </p>
            <div className="grid gap-3 sm:grid-cols-3">
              {SYSTEM_TEMPLATES.map((t) => {
                const Icon = t.icon;
                return (
                  <button
                    key={t.id}
                    onClick={() => selectTemplate(t.id)}
                    className={cn(
                      'group flex flex-col rounded-xl border border-border bg-card overflow-hidden text-left',
                      'hover:-translate-y-0.5 hover:shadow-lg hover:border-primary/30 transition-all duration-200',
                    )}
                  >
                    {/* Gradient header */}
                    <div className={cn('h-20 bg-gradient-to-br relative flex items-end p-3', t.gradient)}>
                      <div
                        className="absolute inset-0 opacity-10"
                        style={{
                          backgroundImage: 'radial-gradient(circle at 70% 30%, white 1px, transparent 1px)',
                          backgroundSize: '20px 20px',
                        }}
                      />
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm">
                        <Icon className="h-3.5 w-3.5 text-white" strokeWidth={1.5} />
                      </div>
                      {t.isPopular && (
                        <span className="absolute top-2.5 right-2.5 flex items-center gap-1 rounded-full bg-secondary/90 px-2 py-0.5 text-[10px] font-semibold text-secondary-foreground backdrop-blur-sm">
                          <Star className="h-2.5 w-2.5 fill-current" />
                          Popular
                        </span>
                      )}
                    </div>
                    <div className="p-3 flex-1">
                      <p className="text-sm font-semibold text-foreground leading-snug">{t.name}</p>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed line-clamp-2">{t.description}</p>
                      <div className="mt-2.5 flex items-center gap-2">
                        <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                          <Layers className="h-3 w-3" strokeWidth={1.5} />
                          {t.sectionCount} sections
                        </span>
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                          {t.industry}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Client details */}
      {step === 'details' && (
        <div className="space-y-5 animate-fade-in-up">
          {/* Selected template indicator */}
          {selectedTemplateData ? (
            <div className="flex items-center gap-3 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3">
              <Sparkles className="h-4 w-4 text-primary shrink-0" strokeWidth={1.5} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">
                  Using: {selectedTemplateData.name}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {selectedTemplateData.sectionCount} sections pre-filled
                </p>
              </div>
              <button
                onClick={() => setStep('template')}
                className="text-xs text-primary hover:text-primary/80 transition-colors duration-150 shrink-0"
              >
                Change
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 px-4 py-3">
              <FileText className="h-4 w-4 text-muted-foreground shrink-0" strokeWidth={1.5} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">Starting from scratch</p>
                <p className="text-xs text-muted-foreground mt-0.5">Blank canvas with empty sections</p>
              </div>
              <button
                onClick={() => setStep('template')}
                className="text-xs text-primary hover:text-primary/80 transition-colors duration-150 shrink-0"
              >
                Change
              </button>
            </div>
          )}

          {/* Form */}
          <div className="rounded-xl border border-border bg-card shadow-card p-5 space-y-4">
            <div className="space-y-1">
              <h2 className="text-sm font-semibold text-foreground">Proposal details</h2>
              <p className="text-xs text-muted-foreground">This information is shown in your proposal header</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2 space-y-1.5">
                <Label htmlFor="title" className="text-xs font-medium">
                  Proposal title <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="title"
                  placeholder="e.g. Website Redesign for Acme Corp"
                  className="h-9 text-sm rounded-lg"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                />
                {errors.title && (
                  <p className="text-xs text-destructive">{errors.title}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="clientName" className="text-xs font-medium">
                  Client name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="clientName"
                  placeholder="Jane Smith"
                  className="h-9 text-sm rounded-lg"
                  value={form.clientName}
                  onChange={(e) => setForm((f) => ({ ...f, clientName: e.target.value }))}
                />
                {errors.clientName && (
                  <p className="text-xs text-destructive">{errors.clientName}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="clientEmail" className="text-xs font-medium">
                  Client email <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="clientEmail"
                  type="email"
                  placeholder="jane@company.com"
                  className="h-9 text-sm rounded-lg"
                  value={form.clientEmail}
                  onChange={(e) => setForm((f) => ({ ...f, clientEmail: e.target.value }))}
                />
                {errors.clientEmail && (
                  <p className="text-xs text-destructive">{errors.clientEmail}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="dealValue" className="text-xs font-medium">
                  Deal value (USD)
                </Label>
                <Input
                  id="dealValue"
                  type="number"
                  placeholder="10000"
                  className="h-9 text-sm rounded-lg"
                  value={form.dealValue}
                  onChange={(e) => setForm((f) => ({ ...f, dealValue: e.target.value }))}
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between gap-3 pt-1">
            <Button
              variant="ghost"
              size="sm"
              className="text-sm"
              onClick={() => setStep('template')}
            >
              Back
            </Button>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href="/proposals">Cancel</Link>
              </Button>
              <Button size="sm" className="gap-1.5 rounded-lg" onClick={handleCreate}>
                Create & open editor
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function NewProposalPage() {
  return (
    <Suspense fallback={
      <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
        <div>
          <h1 className="text-xl font-bold text-foreground tracking-tight">New Proposal</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Loading...</p>
        </div>
      </div>
    }>
      <NewProposalContent />
    </Suspense>
  );
}

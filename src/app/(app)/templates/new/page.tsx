'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Plus,
  Trash2,
  GripVertical,
  ArrowRight,
  Layers,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

const INDUSTRIES = ['Consulting', 'Technology', 'Marketing', 'Design', 'Finance', 'Other'];

const DEFAULT_SECTIONS = [
  { id: '1', name: 'Executive Summary' },
  { id: '2', name: 'Problem Statement' },
  { id: '3', name: 'Our Solution' },
  { id: '4', name: 'Pricing' },
  { id: '5', name: 'Timeline' },
];

interface Section {
  id: string;
  name: string;
}

export default function NewTemplatePage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [industry, setIndustry] = useState('');
  const [sections, setSections] = useState<Section[]>(DEFAULT_SECTIONS);
  const [newSectionName, setNewSectionName] = useState('');
  const [errors, setErrors] = useState<{ name?: string; sections?: string }>({});

  function addSection() {
    const trimmed = newSectionName.trim();
    if (!trimmed) return;
    setSections((prev) => [
      ...prev,
      { id: String(Date.now()), name: trimmed },
    ]);
    setNewSectionName('');
  }

  function removeSection(id: string) {
    setSections((prev) => prev.filter((s) => s.id !== id));
  }

  function updateSection(id: string, value: string) {
    setSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, name: value } : s)),
    );
  }

  function validate() {
    const next: { name?: string; sections?: string } = {};
    if (!name.trim()) next.name = 'Template name is required';
    if (sections.length === 0) next.sections = 'Add at least one section';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleCreate() {
    if (!validate()) return;
    // Demo: navigate back to templates
    router.push('/templates');
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-foreground tracking-tight">New Template</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Create a reusable proposal template for your team
        </p>
      </div>

      {/* Template details */}
      <div className="rounded-xl border border-border bg-card shadow-card p-5 space-y-4">
        <h2 className="text-sm font-semibold text-foreground">Template details</h2>

        <div className="space-y-1.5">
          <Label htmlFor="name" className="text-xs font-medium">
            Template name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="name"
            placeholder="e.g. SaaS Onboarding Proposal"
            className="h-9 text-sm rounded-lg"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          {errors.name && (
            <p className="text-xs text-destructive">{errors.name}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="description" className="text-xs font-medium">
            Description
          </Label>
          <Input
            id="description"
            placeholder="Brief description of when to use this template"
            className="h-9 text-sm rounded-lg"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-medium">Industry</Label>
          <div className="flex flex-wrap gap-2">
            {INDUSTRIES.map((ind) => (
              <button
                key={ind}
                onClick={() => setIndustry((prev) => (prev === ind ? '' : ind))}
                className={cn(
                  'rounded-full px-3 py-1 text-xs font-medium transition-all duration-150',
                  industry === ind
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80',
                )}
              >
                {ind}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Sections */}
      <div className="rounded-xl border border-border bg-card shadow-card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-foreground">Sections</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Define the structure of your template
            </p>
          </div>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Layers className="h-3.5 w-3.5" strokeWidth={1.5} />
            {sections.length} {sections.length === 1 ? 'section' : 'sections'}
          </span>
        </div>

        {errors.sections && (
          <p className="text-xs text-destructive">{errors.sections}</p>
        )}

        {/* Section list */}
        <div className="space-y-2">
          {sections.map((section, idx) => (
            <div
              key={section.id}
              className="flex items-center gap-2 rounded-lg border border-border bg-muted/20 px-3 py-2 group"
            >
              <GripVertical className="h-4 w-4 text-muted-foreground/40 cursor-grab shrink-0" />
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                {idx + 1}
              </span>
              <input
                type="text"
                className="flex-1 bg-transparent text-sm text-foreground outline-none focus:ring-0 placeholder:text-muted-foreground"
                value={section.name}
                onChange={(e) => updateSection(section.id, e.target.value)}
                aria-label={`Section ${idx + 1} name`}
              />
              <button
                onClick={() => removeSection(section.id)}
                className="opacity-0 group-hover:opacity-100 flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-150"
                aria-label={`Remove ${section.name}`}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>

        {/* Add section input */}
        <div className="flex items-center gap-2">
          <Input
            placeholder="Add a section..."
            className="h-9 text-sm rounded-lg flex-1"
            value={newSectionName}
            onChange={(e) => setNewSectionName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addSection();
              }
            }}
            aria-label="New section name"
          />
          <Button
            variant="outline"
            size="sm"
            className="h-9 gap-1.5 rounded-lg shrink-0"
            onClick={addSection}
            disabled={!newSectionName.trim()}
          >
            <Plus className="h-3.5 w-3.5" />
            Add
          </Button>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between gap-3 pt-1">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/templates">Cancel</Link>
        </Button>
        <Button size="sm" className="gap-1.5 rounded-lg" onClick={handleCreate}>
          Create template
          <ArrowRight className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}

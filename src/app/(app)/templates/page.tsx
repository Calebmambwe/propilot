'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, Search, LayoutGrid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TemplateCard } from '@/components/templates/template-card';
import { cn } from '@/lib/utils';

const SYSTEM_TEMPLATES = [
  {
    id: 't1',
    name: 'Consulting Proposal',
    description: 'Professional services engagement with scope, timeline, and deliverables. Perfect for strategy and advisory work.',
    industry: 'Consulting',
    sectionCount: 6,
    isPopular: true,
    isNew: false,
  },
  {
    id: 't2',
    name: 'Dev Agency Proposal',
    description: 'Software development project with tech stack, milestones, and tiered pricing options.',
    industry: 'Technology',
    sectionCount: 8,
    isPopular: true,
    isNew: false,
  },
  {
    id: 't3',
    name: 'Marketing Campaign',
    description: 'Full marketing campaign proposal with strategy, channels, and ROI projections for your client.',
    industry: 'Marketing',
    sectionCount: 7,
    isPopular: false,
    isNew: false,
  },
  {
    id: 't5',
    name: 'Brand Strategy',
    description: 'Comprehensive brand identity and strategy proposal covering positioning, visual system, and guidelines.',
    industry: 'Design',
    sectionCount: 9,
    isPopular: false,
    isNew: true,
  },
  {
    id: 't6',
    name: 'Financial Advisory',
    description: 'Investment and financial advisory service proposal with risk assessments and returns modeling.',
    industry: 'Finance',
    sectionCount: 7,
    isPopular: false,
    isNew: true,
  },
];

const ORG_TEMPLATES = [
  {
    id: 't4',
    name: 'Custom Retainer',
    description: 'Monthly retainer agreement with scope and billing terms for ongoing client relationships.',
    industry: null,
    sectionCount: 5,
    isPopular: false,
    isNew: false,
  },
];

const CATEGORIES = ['All', 'Consulting', 'Technology', 'Marketing', 'Design', 'Finance'];

export default function TemplatesPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filteredSystem = SYSTEM_TEMPLATES.filter((t) => {
    const matchesSearch =
      search === '' ||
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      (t.description?.toLowerCase() ?? '').includes(search.toLowerCase());
    const matchesCategory = category === 'All' || t.industry === category;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 max-w-7xl animate-fade-in">
      {/* ---- Header ---- */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-foreground tracking-tight">Templates</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Start faster with pre-built proposal structures
          </p>
        </div>
        <Button size="sm" className="gap-1.5 rounded-lg shrink-0" asChild>
          <Link href="/templates/new">
            <Plus className="h-3.5 w-3.5" />
            New Template
          </Link>
        </Button>
      </div>

      {/* ---- Search + category filters ---- */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="relative max-w-xs">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search templates..."
            className="pl-9 h-8 text-sm rounded-lg"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search templates"
          />
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={cn(
                'rounded-full px-3 py-1 text-xs font-medium transition-all duration-150',
                category === cat
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80',
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-0.5 ml-auto rounded-lg border border-border bg-muted/50 p-0.5">
          <button
            onClick={() => setViewMode('grid')}
            className={cn(
              'flex h-7 w-7 items-center justify-center rounded-md transition-colors duration-150',
              viewMode === 'grid' ? 'bg-card shadow-card text-foreground' : 'text-muted-foreground hover:text-foreground',
            )}
            aria-label="Grid view"
          >
            <LayoutGrid className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={cn(
              'flex h-7 w-7 items-center justify-center rounded-md transition-colors duration-150',
              viewMode === 'list' ? 'bg-card shadow-card text-foreground' : 'text-muted-foreground hover:text-foreground',
            )}
            aria-label="List view"
          >
            <List className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* ---- Your Templates ---- */}
      {ORG_TEMPLATES.length > 0 && (
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            Your Templates
          </h2>
          <div className={cn(
            viewMode === 'grid'
              ? 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
              : 'space-y-3',
          )}>
            {ORG_TEMPLATES.map((t) => (
              <TemplateCard
                key={t.id}
                id={t.id}
                name={t.name}
                description={t.description}
                industry={t.industry}
                isSystem={false}
                sectionCount={t.sectionCount}
                isPopular={t.isPopular}
                isNew={t.isNew}
                href={`/proposals/new?template=${t.id}`}
              />
            ))}
          </div>
        </section>
      )}

      {/* ---- ProPilot Templates ---- */}
      <section>
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
          ProPilot Templates
          <span className="ml-2 text-[10px] font-normal normal-case">
            {filteredSystem.length} templates
          </span>
        </h2>

        {filteredSystem.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-12 text-center">
            <p className="text-sm font-medium text-foreground">No templates match</p>
            <p className="text-xs text-muted-foreground mt-1">Try a different search or category</p>
            <Button
              variant="ghost"
              size="sm"
              className="mt-3 text-xs"
              onClick={() => { setSearch(''); setCategory('All'); }}
            >
              Clear filters
            </Button>
          </div>
        ) : (
          <div className={cn(
            viewMode === 'grid'
              ? 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
              : 'space-y-3',
          )}>
            {filteredSystem.map((t, i) => (
              <div
                key={t.id}
                className="animate-fade-in-up"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <TemplateCard
                  id={t.id}
                  name={t.name}
                  description={t.description}
                  industry={t.industry}
                  isSystem={true}
                  sectionCount={t.sectionCount}
                  isPopular={t.isPopular}
                  isNew={t.isNew}
                  href={`/proposals/new?template=${t.id}`}
                />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

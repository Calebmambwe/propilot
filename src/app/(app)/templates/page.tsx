'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { TemplateCard } from '@/components/templates/template-card';
import { Plus } from 'lucide-react';

const SYSTEM_TEMPLATES = [
  { id: 't1', name: 'Consulting Proposal', description: 'Professional services engagement with scope, timeline, and deliverables', industry: 'Consulting', sectionCount: 6 },
  { id: 't2', name: 'Dev Agency Proposal', description: 'Software development project with tech stack, milestones, and pricing tiers', industry: 'Technology', sectionCount: 8 },
  { id: 't3', name: 'Marketing Campaign', description: 'Full marketing campaign proposal with strategy, channels, and ROI projections', industry: 'Marketing', sectionCount: 7 },
];

const ORG_TEMPLATES = [
  { id: 't4', name: 'Custom Retainer', description: 'Monthly retainer agreement with scope and billing terms', industry: null, sectionCount: 5 },
];

export default function TemplatesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Templates</h1>
          <p className="text-muted-foreground">
            Reusable proposal structures for faster creation
          </p>
        </div>
        <Button asChild>
          <Link href="/templates/new">
            <Plus className="mr-2 h-4 w-4" />
            New template
          </Link>
        </Button>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">Your Templates</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {ORG_TEMPLATES.map((t) => (
            <TemplateCard
              key={t.id}
              id={t.id}
              name={t.name}
              description={t.description}
              industry={t.industry}
              isSystem={false}
              sectionCount={t.sectionCount}
              href={`/proposals/new?template=${t.id}`}
            />
          ))}
        </div>
      </div>

      <Separator />

      <div>
        <h2 className="text-lg font-semibold mb-4">ProPilot Templates</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {SYSTEM_TEMPLATES.map((t) => (
            <TemplateCard
              key={t.id}
              id={t.id}
              name={t.name}
              description={t.description}
              industry={t.industry}
              isSystem={true}
              sectionCount={t.sectionCount}
              href={`/proposals/new?template=${t.id}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

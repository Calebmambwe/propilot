import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Layers, Pencil, Sparkles, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TemplateCardProps {
  id: string;
  name: string;
  description: string | null;
  industry: string | null;
  sectionCount: number;
  isSystem: boolean;
  isPopular?: boolean;
  isNew?: boolean;
  gradientFrom?: string;
  gradientTo?: string;
  orgId?: string;
  href?: string;
}

const INDUSTRY_COLORS: Record<string, string> = {
  Consulting: 'bg-primary/15 text-primary',
  Technology: 'bg-accent/15 text-accent',
  Marketing: 'bg-secondary/15 text-secondary',
  Finance: 'bg-success/15 text-success',
  Design: 'bg-destructive/15 text-destructive',
};

const GRADIENT_PRESETS = [
  'from-primary/80 to-primary/40',
  'from-accent/80 to-primary/40',
  'from-secondary/80 to-accent/40',
  'from-success/80 to-accent/40',
  'from-destructive/80 to-secondary/40',
];

export function TemplateCard({
  id,
  name,
  description,
  industry,
  sectionCount,
  isSystem,
  isPopular = false,
  isNew = false,
  gradientFrom,
  orgId,
  href,
}: TemplateCardProps) {
  const useHref =
    href ?? (orgId ? `/proposals/new?templateId=${id}&orgId=${orgId}` : `/proposals/new?templateId=${id}`);

  // Deterministic gradient from id
  const gradientIdx = id.charCodeAt(id.length - 1) % GRADIENT_PRESETS.length;
  const gradient = gradientFrom ?? GRADIENT_PRESETS[gradientIdx];

  const industryClass =
    industry && INDUSTRY_COLORS[industry]
      ? INDUSTRY_COLORS[industry]
      : 'bg-muted text-muted-foreground';

  return (
    <div
      className={cn(
        'group relative flex flex-col rounded-xl border border-border bg-card shadow-card overflow-hidden',
        'hover:-translate-y-0.5 hover:shadow-card-hover transition-all duration-200',
      )}
    >
      {/* ---- Gradient header ---- */}
      <div
        className={cn(
          'relative h-24 bg-gradient-to-br',
          gradient,
          'flex items-end p-4',
        )}
        aria-hidden
      >
        {/* Decorative pattern */}
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'radial-gradient(circle at 70% 30%, white 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }}
        />

        {/* Badges */}
        <div className="absolute top-3 right-3 flex gap-1.5">
          {isPopular && (
            <span className="flex items-center gap-1 rounded-full bg-secondary/90 px-2 py-0.5 text-[10px] font-semibold text-secondary-foreground backdrop-blur-sm">
              <Star className="h-2.5 w-2.5 fill-current" />
              Popular
            </span>
          )}
          {isNew && (
            <span className="flex items-center gap-1 rounded-full bg-success/90 px-2 py-0.5 text-[10px] font-semibold text-success-foreground backdrop-blur-sm">
              <Sparkles className="h-2.5 w-2.5" />
              New
            </span>
          )}
          {isSystem && !isPopular && !isNew && (
            <span className="rounded-full bg-card/80 px-2 py-0.5 text-[10px] font-medium text-foreground backdrop-blur-sm">
              ProPilot
            </span>
          )}
        </div>
      </div>

      {/* ---- Card body ---- */}
      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-sm font-semibold text-foreground leading-snug">{name}</h3>

        {description && (
          <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed line-clamp-2">
            {description}
          </p>
        )}

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <Layers className="h-3 w-3" strokeWidth={1.5} />
            {sectionCount} {sectionCount === 1 ? 'section' : 'sections'}
          </span>
          {industry && (
            <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-medium', industryClass)}>
              {industry}
            </span>
          )}
        </div>
      </div>

      {/* ---- Footer actions ---- */}
      <div className="flex items-center gap-2 px-4 pb-4">
        <Button asChild size="sm" className="flex-1 rounded-lg text-xs h-8">
          <Link href={useHref}>Use template</Link>
        </Button>
        {!isSystem && (
          <Button asChild variant="outline" size="sm" className="rounded-lg h-8 w-8 p-0" aria-label="Edit template">
            <Link href={`/templates/${id}/edit`}>
              <Pencil className="h-3.5 w-3.5" />
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}

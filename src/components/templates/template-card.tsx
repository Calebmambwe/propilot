import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Layers } from 'lucide-react';

interface TemplateCardProps {
  id: string;
  name: string;
  description: string | null;
  industry: string | null;
  sectionCount: number;
  isSystem: boolean;
  // Pages pass either orgId or a pre-built href
  orgId?: string;
  href?: string;
}

export function TemplateCard({
  id,
  name,
  description,
  industry,
  sectionCount,
  isSystem,
  orgId,
  href,
}: TemplateCardProps) {
  const useHref = href ?? (orgId ? `/proposals/new?templateId=${id}&orgId=${orgId}` : `/proposals/new?templateId=${id}`);

  return (
    <Card className="flex flex-col hover:border-primary/50 transition-colors">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
              <FileText className="h-4 w-4 text-primary" />
            </div>
            <CardTitle className="text-base leading-tight">{name}</CardTitle>
          </div>
          {isSystem && (
            <Badge variant="outline" className="shrink-0 text-xs">
              System
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1 pb-3">
        {description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{description}</p>
        )}
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Layers className="h-3 w-3" />
            {sectionCount} {sectionCount === 1 ? 'section' : 'sections'}
          </span>
          {industry && (
            <Badge variant="secondary" className="text-xs font-normal">
              {industry}
            </Badge>
          )}
        </div>
      </CardContent>

      <CardFooter className="gap-2 pt-0">
        <Button asChild size="sm" className="flex-1">
          <Link href={useHref}>
            Use template
          </Link>
        </Button>
        {!isSystem && (
          <Button asChild variant="outline" size="sm">
            <Link href={`/templates/${id}/edit`}>Edit</Link>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

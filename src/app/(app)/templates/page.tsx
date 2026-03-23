import { Suspense } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { TemplateCard } from '@/components/templates/template-card';
import { Separator } from '@/components/ui/separator';

async function TemplateList({ orgId }: { orgId: string }) {
  const supabase = await createClient();

  const { data: templates } = await supabase
    .from('templates')
    .select('id, name, description, industry, is_system, created_at, template_sections(id)')
    .or(`org_id.eq.${orgId},is_system.eq.true`)
    .order('is_system', { ascending: false });

  const systemTemplates = (templates ?? []).filter((t) => t.is_system);
  const orgTemplates = (templates ?? []).filter((t) => !t.is_system);

  return (
    <div className="space-y-8">
      {orgTemplates.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4">Your Templates</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {orgTemplates.map((t) => (
              <TemplateCard
                key={t.id as string}
                id={t.id as string}
                name={t.name as string}
                description={t.description as string | null}
                industry={t.industry as string | null}
                isSystem={false}
                sectionCount={
                  Array.isArray(t.template_sections)
                    ? t.template_sections.length
                    : 0
                }
                href={`/proposals/new?template=${t.id as string}`}
              />
            ))}
          </div>
        </div>
      )}

      <Separator />

      <div>
        <h2 className="text-lg font-semibold mb-4">ProPilot Templates</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {systemTemplates.map((t) => (
            <TemplateCard
              key={t.id as string}
              id={t.id as string}
              name={t.name as string}
              description={t.description as string | null}
              industry={t.industry as string | null}
              isSystem={true}
              sectionCount={
                Array.isArray(t.template_sections)
                  ? t.template_sections.length
                  : 0
              }
              href={`/proposals/new?template=${t.id as string}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function TemplateListSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-40 w-full rounded-lg" />
      ))}
    </div>
  );
}

export default async function TemplatesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: membership } = await supabase
    .from('organization_members')
    .select('org_id')
    .eq('user_id', user!.id)
    .limit(1)
    .single();

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
          <Link href="/templates/new">New template</Link>
        </Button>
      </div>

      {membership ? (
        <Suspense fallback={<TemplateListSkeleton />}>
          <TemplateList orgId={membership.org_id as string} />
        </Suspense>
      ) : (
        <p className="text-muted-foreground">
          Set up your organization to manage templates.
        </p>
      )}
    </div>
  );
}

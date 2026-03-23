import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { TemplateCard } from '@/components/templates/template-card';

export default async function NewProposalPage() {
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

  const { data: templates } = await supabase
    .from('templates')
    .select('id, name, description, industry, is_system, template_sections(id)')
    .or(
      membership
        ? `org_id.eq.${membership.org_id as string},is_system.eq.true`
        : 'is_system.eq.true',
    )
    .order('is_system', { ascending: false });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">New Proposal</h1>
        <p className="text-muted-foreground">
          Choose a template to get started
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Link href="/proposals/new?template=blank">
          <Card className="cursor-pointer hover:border-primary transition-colors h-full">
            <CardHeader>
              <CardTitle className="text-lg">Blank proposal</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Start from scratch with a blank canvas
              </p>
            </CardContent>
          </Card>
        </Link>

        {(templates ?? []).map((t) => (
          <TemplateCard
            key={t.id as string}
            id={t.id as string}
            name={t.name as string}
            description={t.description as string | null}
            industry={t.industry as string | null}
            isSystem={t.is_system as boolean}
            sectionCount={
              Array.isArray(t.template_sections)
                ? t.template_sections.length
                : 0
            }
            href={`/proposals/new?template=${t.id as string}`}
          />
        ))}
      </div>

      <div className="flex justify-start">
        <Button variant="outline" asChild>
          <Link href="/proposals">Cancel</Link>
        </Button>
      </div>
    </div>
  );
}

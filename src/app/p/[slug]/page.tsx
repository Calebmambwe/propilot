import { notFound } from 'next/navigation';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { TrackingScript } from '@/components/tracking/tracking-script';
import type { ProposalContent } from '@/types/domain';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type Params = Promise<{ slug: string }>;

export default async function PublicProposalPage({ params }: { params: Params }) {
  const { slug } = await params;

  // Use service role to bypass RLS for public view
  const supabase = await createServiceRoleClient();

  const { data: proposal, error } = await supabase
    .from('proposals')
    .select('id, title, client_name, client_company, content, status, expires_at, org_id')
    .eq('slug', slug)
    .single();

  if (error ?? !proposal) {
    notFound();
  }

  // Draft proposals are not publicly accessible
  if (proposal.status === 'draft') {
    notFound();
  }

  // Expired proposals show a specific page
  if (
    proposal.expires_at &&
    new Date(proposal.expires_at as string) < new Date()
  ) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md text-center px-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            This proposal has expired
          </h1>
          <p className="text-gray-600">
            The link for this proposal is no longer active. Please contact the
            sender to request a new link.
          </p>
        </div>
      </div>
    );
  }

  const content = proposal.content as ProposalContent;
  const sectionIds = content.sections.map((s) => s.id);

  // Fetch org to check white_label
  const { data: org } = await supabase
    .from('organizations')
    .select('white_label')
    .eq('id', proposal.org_id as string)
    .single();

  const showPoweredBy = !(org?.white_label as boolean | undefined);

  return (
    <>
      {/* Tracking pixel — fires on page load */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`/api/track/open/${proposal.id as string}.gif`}
        alt=""
        width={1}
        height={1}
        style={{ display: 'none' }}
      />

      {/* Client-side tracking script for section engagement */}
      <TrackingScript proposalId={proposal.id as string} sectionIds={sectionIds} />

      <div className="min-h-screen bg-white">
        {/* Header */}
        <div className="border-b bg-white sticky top-0 z-10 px-6 py-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-xl font-semibold text-gray-900">
              {proposal.title as string}
            </h1>
            {proposal.client_company && (
              <p className="text-sm text-gray-500">
                Prepared for {proposal.client_name as string},{' '}
                {proposal.client_company as string}
              </p>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto px-6 py-10">
          {content.sections.map((section) => (
            <section
              key={section.id}
              id={`section-${section.id}`}
              data-section-id={section.id}
              className="mb-12"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b">
                {section.name}
              </h2>
              <div
                className="prose prose-gray max-w-none"
                dangerouslySetInnerHTML={{ __html: section.content }}
              />
            </section>
          ))}
        </div>

        {/* Footer */}
        {showPoweredBy && (
          <footer className="border-t py-6 px-6 bg-gray-50">
            <div className="max-w-4xl mx-auto text-center">
              <p className="text-sm text-gray-400">
                Created with{' '}
                <a
                  href="https://propilot.app"
                  className="text-gray-600 hover:underline font-medium"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  ProPilot
                </a>{' '}
                — AI proposal intelligence
              </p>
            </div>
          </footer>
        )}
      </div>
    </>
  );
}

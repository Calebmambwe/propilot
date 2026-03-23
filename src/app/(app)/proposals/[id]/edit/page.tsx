import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ProposalEditor } from '@/components/proposals/proposal-editor';
import type { ProposalContent } from '@/types/domain';

type Params = Promise<{ id: string }>;

export default async function EditProposalPage({ params }: { params: Params }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: proposal, error } = await supabase
    .from('proposals')
    .select('*')
    .eq('id', id)
    .single();

  if (error ?? !proposal) {
    notFound();
  }

  return (
    <div className="max-w-5xl mx-auto">
      <ProposalEditor
        proposalId={id}
        initialData={{
          title: proposal.title as string,
          clientName: proposal.client_name as string,
          clientEmail: proposal.client_email as string,
          clientCompany: proposal.client_company as string | null,
          dealValue: proposal.deal_value as number | null,
          industry: proposal.industry as string | null,
          content: proposal.content as ProposalContent,
          status: proposal.status as string,
        }}
      />
    </div>
  );
}

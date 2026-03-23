import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { ProposalStatusBadge } from '@/components/proposals/proposal-status-badge';
import { formatCurrency, formatRelativeTime } from '@/lib/utils';
import type { ProposalOutcome, ProposalStatus } from '@/types/domain';

interface ProposalCardProps {
  id: string;
  slug: string;
  title: string;
  clientName: string;
  clientCompany: string | null;
  dealValue: number | null;
  status: ProposalStatus;
  outcome: ProposalOutcome | null;
  sentAt: string | null;
  firstOpenedAt: string | null;
  createdAt: string;
}

export function ProposalCard({
  id,
  title,
  clientName,
  clientCompany,
  dealValue,
  status,
  createdAt,
  sentAt,
}: ProposalCardProps) {
  return (
    <Card className="hover:border-primary/50 transition-colors">
      <CardContent className="py-4">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1">
              <Link
                href={`/proposals/${id}/edit`}
                className="font-medium hover:underline truncate"
              >
                {title}
              </Link>
              <ProposalStatusBadge status={status} />
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>
                {clientName}
                {clientCompany ? ` · ${clientCompany}` : ''}
              </span>
              {dealValue != null && (
                <span className="font-medium text-foreground">
                  {formatCurrency(dealValue)}
                </span>
              )}
              <span>
                {sentAt
                  ? `Sent ${formatRelativeTime(sentAt)}`
                  : `Created ${formatRelativeTime(createdAt)}`}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 ml-4">
            <Link
              href={`/proposals/${id}/edit`}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Edit
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

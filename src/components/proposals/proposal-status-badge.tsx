import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { ProposalStatus } from '@/types/domain';

const STATUS_CONFIG: Record<
  ProposalStatus,
  { label: string; className: string }
> = {
  draft: { label: 'Draft', className: 'bg-gray-100 text-gray-700 border-gray-200' },
  sent: { label: 'Sent', className: 'bg-blue-50 text-blue-700 border-blue-200' },
  opened: { label: 'Opened', className: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  won: { label: 'Won', className: 'bg-green-50 text-green-700 border-green-200' },
  lost: { label: 'Lost', className: 'bg-red-50 text-red-700 border-red-200' },
  expired: { label: 'Expired', className: 'bg-gray-50 text-gray-500 border-gray-200' },
};

interface ProposalStatusBadgeProps {
  status: ProposalStatus;
  className?: string;
}

export function ProposalStatusBadge({ status, className }: ProposalStatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  return (
    <Badge
      variant="outline"
      className={cn(config.className, className)}
    >
      {config.label}
    </Badge>
  );
}

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTRPC } from '@/trpc/client';
import { useMutation } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle, ExternalLink } from 'lucide-react';

interface SendDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  proposalId: string;
}

export function SendDialog({ open, onOpenChange, proposalId }: SendDialogProps) {
  const router = useRouter();
  const trpc = useTRPC();
  const [publicUrl, setPublicUrl] = useState<string | null>(null);

  const sendProposal = useMutation(
    trpc.proposals.send.mutationOptions({
      onSuccess: (data: { id: string; slug: string; status: 'sent'; sentAt: string; publicUrl: string }) => {
        setPublicUrl(data.publicUrl);
      },
    }),
  );

  function handleSend() {
    sendProposal.mutate({ id: proposalId });
  }

  function handleClose() {
    onOpenChange(false);
    if (publicUrl) {
      router.push('/proposals');
      router.refresh();
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {publicUrl ? 'Proposal Sent!' : 'Send Proposal'}
          </DialogTitle>
          <DialogDescription>
            {publicUrl
              ? 'Your proposal has been sent. Share this link with your prospect.'
              : 'Once sent, your prospect will receive a tracked link. You will be notified when they open it.'}
          </DialogDescription>
        </DialogHeader>

        {publicUrl ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-green-600">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">Proposal sent successfully</span>
            </div>
            <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
              <code className="flex-1 text-sm truncate">{publicUrl}</code>
              <Button
                variant="ghost"
                size="icon"
                asChild
              >
                <a href={publicUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Your proposal will be marked as sent and a 90-day expiry will be set.
            </p>
            {sendProposal.isError && (
              <p className="text-sm text-destructive">
                {sendProposal.error.message}
              </p>
            )}
          </div>
        )}

        <DialogFooter>
          {publicUrl ? (
            <Button onClick={handleClose}>Done</Button>
          ) : (
            <>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                onClick={handleSend}
                disabled={sendProposal.isPending}
              >
                {sendProposal.isPending ? 'Sending...' : 'Send proposal'}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

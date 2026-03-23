'use client';

import { useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTRPC } from '@/trpc/client';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SendDialog } from '@/components/proposals/send-dialog';
import type { ProposalContent } from '@/types/domain';

const ProposalMetaSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  clientName: z.string().min(1, 'Client name is required').max(150),
  clientEmail: z.string().email('Enter a valid email'),
  clientCompany: z.string().max(150).optional(),
  dealValue: z.number().positive().optional(),
  industry: z.string().max(100).optional(),
});

type ProposalMetaFormData = z.infer<typeof ProposalMetaSchema>;

interface ProposalEditorProps {
  proposalId: string;
  initialData: {
    title: string;
    clientName: string;
    clientEmail: string;
    clientCompany: string | null;
    dealValue: number | null;
    industry: string | null;
    content: ProposalContent;
    status: string;
  };
}

interface SectionEditorProps {
  section: ProposalContent['sections'][number];
  onContentChange: (id: string, content: string) => void;
}

function SectionEditor({ section, onContentChange }: SectionEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: 'Write this section...' }),
    ],
    content: section.content,
    onUpdate: ({ editor: ed }) => {
      onContentChange(section.id, ed.getHTML());
    },
  });

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="border-b bg-muted px-4 py-2">
        <h3 className="font-medium text-sm">{section.name}</h3>
      </div>
      <EditorContent
        editor={editor}
        className="prose prose-sm max-w-none p-4 min-h-[120px] focus-within:outline-none"
      />
    </div>
  );
}

export function ProposalEditor({ proposalId, initialData }: ProposalEditorProps) {
  const trpc = useTRPC();
  const [isSendDialogOpen, setIsSendDialogOpen] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [sections, setSections] = useState(initialData.content.sections);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProposalMetaFormData>({
    resolver: zodResolver(ProposalMetaSchema),
    defaultValues: {
      title: initialData.title,
      clientName: initialData.clientName,
      clientEmail: initialData.clientEmail,
      clientCompany: initialData.clientCompany ?? '',
      dealValue: initialData.dealValue ?? undefined,
      industry: initialData.industry ?? '',
    },
  });

  const updateProposal = useMutation(
    trpc.proposals.update.mutationOptions({
      onSuccess: () => {
        setSavedAt(new Date().toLocaleTimeString());
      },
    }),
  );

  function handleSectionContentChange(id: string, content: string) {
    setSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, content } : s)),
    );
  }

  async function onSave(meta: ProposalMetaFormData) {
    const content: ProposalContent = {
      ...initialData.content,
      sections,
    };

    updateProposal.mutate({
      id: proposalId,
      title: meta.title,
      clientName: meta.clientName,
      clientEmail: meta.clientEmail,
      clientCompany: meta.clientCompany ?? null,
      dealValue: meta.dealValue ?? null,
      industry: meta.industry ?? null,
      content,
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Edit Proposal</h1>
        <div className="flex items-center gap-3">
          {savedAt && (
            <span className="text-sm text-muted-foreground">
              Saved at {savedAt}
            </span>
          )}
          <Button
            variant="outline"
            onClick={handleSubmit(onSave)}
            disabled={updateProposal.isPending}
          >
            {updateProposal.isPending ? 'Saving...' : 'Save'}
          </Button>
          {initialData.status === 'draft' && (
            <Button onClick={() => setIsSendDialogOpen(true)}>
              Review & Send
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Proposal Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" {...register('title')} />
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="clientName">Client name</Label>
              <Input id="clientName" {...register('clientName')} />
              {errors.clientName && (
                <p className="text-sm text-destructive">
                  {errors.clientName.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="clientEmail">Client email</Label>
              <Input id="clientEmail" type="email" {...register('clientEmail')} />
              {errors.clientEmail && (
                <p className="text-sm text-destructive">
                  {errors.clientEmail.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="clientCompany">Company (optional)</Label>
              <Input id="clientCompany" {...register('clientCompany')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dealValue">Deal value (USD)</Label>
              <Input
                id="dealValue"
                type="number"
                step="100"
                {...register('dealValue', { valueAsNumber: true })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="industry">Industry</Label>
              <Input id="industry" {...register('industry')} />
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Proposal Content</h2>
        {sections.length > 0 ? (
          sections.map((section) => (
            <SectionEditor
              key={section.id}
              section={section}
              onContentChange={handleSectionContentChange}
            />
          ))
        ) : (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No sections yet. Add sections to build your proposal.
            </CardContent>
          </Card>
        )}
      </div>

      <SendDialog
        open={isSendDialogOpen}
        onOpenChange={setIsSendDialogOpen}
        proposalId={proposalId}
      />
    </div>
  );
}

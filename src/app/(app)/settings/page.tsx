'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTRPC } from '@/trpc/client';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const OrgSettingsSchema = z.object({
  name: z.string().min(2).max(150),
});

type OrgSettingsFormData = z.infer<typeof OrgSettingsSchema>;

export default function SettingsPage() {
  const [saved, setSaved] = useState(false);
  const trpc = useTRPC();

  const updateOrg = useMutation(
    trpc.organizations.update.mutationOptions({
      onSuccess: () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      },
    }),
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<OrgSettingsFormData>({
    resolver: zodResolver(OrgSettingsSchema),
  });

  function onSubmit(_data: OrgSettingsFormData) {
    // TODO: pass actual orgId from context
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your organization settings</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Organization</CardTitle>
          <CardDescription>Update your organization name and preferences</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Organization name</Label>
              <Input id="name" {...register('name')} />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>
            <Button type="submit" disabled={updateOrg.isPending}>
              {updateOrg.isPending ? 'Saving...' : saved ? 'Saved!' : 'Save changes'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

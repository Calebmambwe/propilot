import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import type { MemberRole } from '@/types/domain';

export default async function TeamPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: membership } = await supabase
    .from('organization_members')
    .select('org_id, role')
    .eq('user_id', user!.id)
    .limit(1)
    .single();

  const { data: members } = membership
    ? await supabase
        .from('organization_members')
        .select('id, user_id, role, joined_at, users(email, full_name, avatar_url)')
        .eq('org_id', membership.org_id as string)
        .order('joined_at')
    : { data: [] };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Team</h1>
        <p className="text-muted-foreground">Manage your team members</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Members</CardTitle>
          <CardDescription>
            People with access to your ProPilot workspace
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {(members ?? []).map((m) => {
              const memberUser = Array.isArray(m.users) ? m.users[0] : m.users;
              const fullName = memberUser?.full_name as string | undefined;
              const email = memberUser?.email as string | undefined;
              const initials = fullName
                ? fullName
                    .split(' ')
                    .map((n: string) => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2)
                : (email?.[0]?.toUpperCase() ?? '?');

              return (
                <div
                  key={m.id as string}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{fullName ?? email}</p>
                      {fullName && (
                        <p className="text-sm text-muted-foreground">{email}</p>
                      )}
                    </div>
                  </div>
                  <Badge variant="outline" className="capitalize">
                    {m.role as MemberRole}
                  </Badge>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

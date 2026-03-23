'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  UserPlus,
  MoreHorizontal,
  Crown,
  Shield,
  User,
  CreditCard,
  Users,
  Building2,
  Check,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

type MemberRole = 'owner' | 'admin' | 'member';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: MemberRole;
  joinedAt: string;
  avatarInitials: string;
  avatarColor: string;
}

const DEMO_MEMBERS: TeamMember[] = [
  {
    id: 'm1',
    name: 'Caleb M.',
    email: 'caleb@agency.com',
    role: 'owner',
    joinedAt: 'Jan 12, 2025',
    avatarInitials: 'CM',
    avatarColor: 'bg-primary/20 text-primary',
  },
  {
    id: 'm2',
    name: 'Sarah K.',
    email: 'sarah@agency.com',
    role: 'admin',
    joinedAt: 'Feb 3, 2025',
    avatarInitials: 'SK',
    avatarColor: 'bg-accent/20 text-accent',
  },
  {
    id: 'm3',
    name: 'James L.',
    email: 'james@agency.com',
    role: 'member',
    joinedAt: 'Mar 1, 2025',
    avatarInitials: 'JL',
    avatarColor: 'bg-secondary/20 text-secondary',
  },
];

const ROLE_CONFIG: Record<MemberRole, { label: string; icon: React.ElementType; className: string }> = {
  owner: {
    label: 'Owner',
    icon: Crown,
    className: 'bg-secondary/15 text-secondary border-secondary/30',
  },
  admin: {
    label: 'Admin',
    icon: Shield,
    className: 'bg-primary/15 text-primary border-primary/30',
  },
  member: {
    label: 'Member',
    icon: User,
    className: 'bg-muted text-muted-foreground border-border',
  },
};

const SETTINGS_NAV = [
  { href: '/settings', label: 'Account', icon: Building2 },
  { href: '/settings/billing', label: 'Billing & Plan', icon: CreditCard },
  { href: '/settings/team', label: 'Team', icon: Users },
];

export default function TeamPage() {
  const [members, setMembers] = useState<TeamMember[]>(DEMO_MEMBERS);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<MemberRole>('member');
  const [inviteSent, setInviteSent] = useState(false);
  const [inviteError, setInviteError] = useState('');
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  function handleInvite() {
    if (!inviteEmail.trim()) {
      setInviteError('Email is required');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inviteEmail)) {
      setInviteError('Enter a valid email address');
      return;
    }
    setInviteError('');
    setInviteSent(true);
    setTimeout(() => {
      setInviteSent(false);
      setInviteEmail('');
    }, 2500);
  }

  function removeMember(id: string) {
    setMembers((prev) => prev.filter((m) => m.id !== id));
    setMenuOpen(null);
  }

  return (
    <div className="max-w-3xl space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-foreground tracking-tight">Team</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Manage your team members and their access levels
        </p>
      </div>

      {/* Settings sub-nav */}
      <div className="flex items-center gap-0.5 rounded-lg border border-border bg-muted/30 p-0.5 w-fit">
        {SETTINGS_NAV.map((item) => {
          const Icon = item.icon;
          const isActive = item.href === '/settings/team';
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all duration-150',
                isActive
                  ? 'bg-card text-foreground shadow-card'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <Icon className="h-3 w-3" strokeWidth={1.5} />
              {item.label}
            </Link>
          );
        })}
      </div>

      {/* Members list */}
      <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div>
            <h2 className="text-sm font-semibold text-foreground">Members</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {members.length} of 5 seats used
            </p>
          </div>
          <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-primary/15 px-1 text-[10px] font-medium text-primary">
            {members.length}
          </span>
        </div>

        <div className="divide-y divide-border">
          {members.map((member) => {
            const role = ROLE_CONFIG[member.role];
            const RoleIcon = role.icon;
            const isCurrentUser = member.id === 'm1';

            return (
              <div
                key={member.id}
                className="flex items-center gap-3 px-5 py-3.5 hover:bg-muted/20 transition-colors duration-150 group"
              >
                {/* Avatar */}
                <div
                  className={cn(
                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold',
                    member.avatarColor,
                  )}
                >
                  {member.avatarInitials}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground truncate">
                      {member.name}
                    </span>
                    {isCurrentUser && (
                      <span className="text-[10px] text-muted-foreground">(you)</span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">{member.email}</p>
                </div>

                {/* Role badge */}
                <span
                  className={cn(
                    'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold',
                    role.className,
                  )}
                >
                  <RoleIcon className="h-2.5 w-2.5" />
                  {role.label}
                </span>

                {/* Joined date */}
                <span className="hidden md:block text-xs text-muted-foreground shrink-0">
                  Joined {member.joinedAt}
                </span>

                {/* Actions */}
                {!isCurrentUser && (
                  <div className="relative opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpen((v) => (v === member.id ? null : member.id));
                      }}
                      className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors duration-150"
                      aria-label="Member actions"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </button>

                    {menuOpen === member.id && (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setMenuOpen(null)}
                          aria-hidden
                        />
                        <div className="absolute right-0 top-8 z-20 w-40 rounded-xl border border-border bg-card shadow-elevated py-1 animate-scale-in">
                          <button
                            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors duration-150"
                            onClick={() => setMenuOpen(null)}
                          >
                            <Shield className="h-3.5 w-3.5" />
                            Change role
                          </button>
                          <div className="my-1 border-t border-border" />
                          <button
                            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors duration-150"
                            onClick={() => removeMember(member.id)}
                          >
                            <X className="h-3.5 w-3.5" />
                            Remove member
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Invite member */}
      <div className="rounded-xl border border-border bg-card shadow-card p-5 space-y-4">
        <div className="flex items-center gap-2">
          <UserPlus className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
          <div>
            <h2 className="text-sm font-semibold text-foreground">Invite a team member</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              They&apos;ll receive an email invitation to join your workspace
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 space-y-1.5">
            <Label htmlFor="inviteEmail" className="text-xs font-medium">
              Email address
            </Label>
            <Input
              id="inviteEmail"
              type="email"
              placeholder="colleague@company.com"
              className="h-9 text-sm rounded-lg"
              value={inviteEmail}
              onChange={(e) => {
                setInviteEmail(e.target.value);
                setInviteError('');
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleInvite();
              }}
            />
            {inviteError && (
              <p className="text-xs text-destructive">{inviteError}</p>
            )}
          </div>

          <div className="space-y-1.5 sm:w-36">
            <Label className="text-xs font-medium">Role</Label>
            <div className="flex items-center gap-0.5 rounded-lg border border-border bg-muted/50 p-0.5 h-9">
              {(['member', 'admin'] as MemberRole[]).map((r) => (
                <button
                  key={r}
                  onClick={() => setInviteRole(r)}
                  className={cn(
                    'flex-1 rounded-md py-1 text-xs font-medium capitalize transition-all duration-150',
                    inviteRole === r
                      ? 'bg-card text-foreground shadow-card'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        </div>

        <Button
          size="sm"
          className={cn(
            'gap-1.5 rounded-lg transition-all duration-200',
            inviteSent && 'bg-success hover:bg-success text-success-foreground',
          )}
          onClick={handleInvite}
          disabled={inviteSent}
        >
          {inviteSent ? (
            <>
              <Check className="h-3.5 w-3.5" />
              Invitation sent
            </>
          ) : (
            <>
              <UserPlus className="h-3.5 w-3.5" />
              Send invitation
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

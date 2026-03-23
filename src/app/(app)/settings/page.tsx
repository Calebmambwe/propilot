'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  User,
  Building2,
  CreditCard,
  Users,
  Camera,
  ChevronRight,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

const SETTINGS_NAV = [
  {
    href: '/settings',
    label: 'Account',
    description: 'Your personal info and preferences',
    icon: User,
  },
  {
    href: '/settings/billing',
    label: 'Billing & Plan',
    description: 'Manage your subscription and usage',
    icon: CreditCard,
  },
  {
    href: '/settings/team',
    label: 'Team',
    description: 'Manage team members and roles',
    icon: Users,
  },
];

export default function SettingsPage() {
  const [name, setName] = useState('Caleb Mambwe');
  const [email, setEmail] = useState('caleb@agency.com');
  const [orgName, setOrgName] = useState('Agency Workspace');
  const [saved, setSaved] = useState(false);

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div className="max-w-3xl space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-foreground tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Manage your account and organization preferences
        </p>
      </div>

      {/* Settings navigation cards */}
      <div className="grid gap-3 sm:grid-cols-3">
        {SETTINGS_NAV.map((item) => {
          const Icon = item.icon;
          const isActive = item.href === '/settings';
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-xl border p-4 transition-all duration-150',
                'hover:shadow-card-hover hover:-translate-y-0.5',
                isActive
                  ? 'border-primary/30 bg-primary/5 shadow-card'
                  : 'border-border bg-card shadow-card hover:border-primary/20',
              )}
            >
              <div
                className={cn(
                  'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
                  isActive ? 'bg-primary/15' : 'bg-muted',
                )}
              >
                <Icon
                  className={cn('h-4 w-4', isActive ? 'text-primary' : 'text-muted-foreground')}
                  strokeWidth={1.5}
                />
              </div>
              <div className="min-w-0">
                <p className={cn('text-sm font-medium', isActive ? 'text-primary' : 'text-foreground')}>
                  {item.label}
                </p>
                <p className="text-xs text-muted-foreground truncate mt-0.5">{item.description}</p>
              </div>
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0 ml-auto" />
            </Link>
          );
        })}
      </div>

      {/* Account settings */}
      <div className="rounded-xl border border-border bg-card shadow-card p-5 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-foreground">Account</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Your personal profile information</p>
          </div>
        </div>

        {/* Avatar */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/20 text-primary text-xl font-bold">
              CM
            </div>
            <button
              className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-card shadow-card text-muted-foreground hover:text-foreground transition-colors duration-150"
              aria-label="Upload photo"
            >
              <Camera className="h-3 w-3" />
            </button>
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">{name}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{email}</p>
            <button className="text-xs text-primary hover:text-primary/80 transition-colors duration-150 mt-1">
              Upload photo
            </button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="fullName" className="text-xs font-medium">Full name</Label>
            <Input
              id="fullName"
              className="h-9 text-sm rounded-lg"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs font-medium">Email</Label>
            <Input
              id="email"
              type="email"
              className="h-9 text-sm rounded-lg"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Organization settings */}
      <div className="rounded-xl border border-border bg-card shadow-card p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
          <div>
            <h2 className="text-sm font-semibold text-foreground">Organization</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Visible to all team members</p>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="orgName" className="text-xs font-medium">Organization name</Label>
          <Input
            id="orgName"
            className="h-9 text-sm rounded-lg"
            value={orgName}
            onChange={(e) => setOrgName(e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-medium">Organization logo</Label>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-dashed border-border bg-muted text-muted-foreground text-xs">
              Logo
            </div>
            <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5 rounded-lg">
              <Camera className="h-3.5 w-3.5" />
              Upload logo
            </Button>
          </div>
        </div>
      </div>

      {/* Save */}
      <div className="flex items-center justify-end gap-3 pb-2">
        <Button
          size="sm"
          className={cn(
            'gap-1.5 rounded-lg transition-all duration-200',
            saved && 'bg-success hover:bg-success text-success-foreground',
          )}
          onClick={handleSave}
        >
          {saved ? (
            <>
              <Check className="h-3.5 w-3.5" />
              Saved
            </>
          ) : (
            'Save changes'
          )}
        </Button>
      </div>
    </div>
  );
}

'use client';

import { usePathname } from 'next/navigation';
import {
  Search,
  Bell,
  Plus,
  ChevronRight,
  Command,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const BREADCRUMB_LABELS: Record<string, string> = {
  dashboard: 'Dashboard',
  proposals: 'Proposals',
  templates: 'Templates',
  analytics: 'Analytics',
  settings: 'Settings',
  new: 'New',
  edit: 'Edit',
  billing: 'Billing',
  team: 'Team',
};

function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);

  if (segments.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className="hidden sm:flex items-center gap-1 text-sm">
      {segments.map((seg, idx) => {
        const isLast = idx === segments.length - 1;
        const href = '/' + segments.slice(0, idx + 1).join('/');
        const label = BREADCRUMB_LABELS[seg] ?? seg;

        return (
          <span key={href} className="flex items-center gap-1">
            {idx > 0 && (
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
            )}
            {isLast ? (
              <span className="font-medium text-foreground">{label}</span>
            ) : (
              <Link
                href={href}
                className="text-muted-foreground hover:text-foreground transition-colors duration-150"
              >
                {label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}

export function Header() {
  return (
    <header
      className={cn(
        'flex h-14 shrink-0 items-center justify-between gap-4',
        'border-b border-border bg-card/80 backdrop-blur-lg',
        'px-4 sm:px-6',
        'sticky top-0 z-10',
      )}
    >
      {/* Left: Breadcrumbs */}
      <div className="flex items-center gap-3 min-w-0">
        <Breadcrumbs />
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1 shrink-0">
        {/* Command palette trigger */}
        <button
          className={cn(
            'hidden sm:flex items-center gap-2 px-3 h-8 rounded-md text-sm text-muted-foreground',
            'border border-border bg-muted/50',
            'hover:bg-muted hover:text-foreground transition-colors duration-150',
            'cursor-pointer',
          )}
          aria-label="Open command palette (⌘K)"
        >
          <Search className="h-3.5 w-3.5" />
          <span className="hidden lg:inline text-xs">Search...</span>
          <kbd className="hidden lg:inline ml-1 text-[10px] font-mono text-muted-foreground">
            <span className="flex items-center gap-0.5">
              <Command className="h-2.5 w-2.5" />K
            </span>
          </kbd>
        </button>

        {/* Notifications */}
        <Button
          variant="ghost"
          size="icon"
          className="relative h-8 w-8 rounded-md"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" strokeWidth={1.5} />
          <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-primary" aria-hidden />
        </Button>

        {/* Quick new proposal */}
        <Button
          size="sm"
          className="h-8 gap-1.5 rounded-lg text-xs font-medium"
          asChild
        >
          <Link href="/proposals/new">
            <Plus className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">New Proposal</span>
          </Link>
        </Button>
      </div>
    </header>
  );
}

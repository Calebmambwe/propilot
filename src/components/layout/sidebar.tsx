'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  BarChart3,
  Settings,
  BookTemplate,
  ChevronLeft,
  ChevronRight,
  Building2,
  LogOut,
  User,
  ChevronsUpDown,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  shortcut: string;
  badge?: string;
}

const NAV_MAIN: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, shortcut: '⌘1' },
  { href: '/proposals', label: 'Proposals', icon: FileText, shortcut: '⌘2', badge: '7' },
  { href: '/templates', label: 'Templates', icon: BookTemplate, shortcut: '⌘3' },
  { href: '/analytics', label: 'Analytics', icon: BarChart3, shortcut: '⌘4' },
];

const NAV_BOTTOM: NavItem[] = [
  { href: '/settings', label: 'Settings', icon: Settings, shortcut: '⌘,' },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  function isActive(item: NavItem) {
    return (
      pathname === item.href ||
      (item.href !== '/dashboard' && pathname.startsWith(item.href))
    );
  }

  return (
    <aside
      className={cn(
        'relative hidden md:flex flex-col h-screen shrink-0 overflow-hidden',
        'bg-sidebar border-r border-sidebar-border',
        'transition-all duration-200 ease-out',
        collapsed ? 'w-16' : 'w-60',
      )}
      aria-label="Main navigation"
    >
      {/* --- Logo / Org Header --- */}
      <div
        className={cn(
          'flex h-16 items-center border-b border-sidebar-border shrink-0',
          collapsed ? 'justify-center px-0' : 'px-4 gap-3',
        )}
      >
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary">
          <Zap className="h-4 w-4 text-primary-foreground" strokeWidth={2} />
        </div>
        {!collapsed && (
          <div className="flex-1 min-w-0 animate-fade-in">
            <p className="truncate text-sm font-semibold text-foreground leading-none">
              ProPilot
            </p>
            <p className="truncate text-xs text-muted-foreground mt-0.5">
              Agency Workspace
            </p>
          </div>
        )}
        {!collapsed && (
          <button
            onClick={() => setCollapsed(true)}
            className="ml-auto flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors duration-150"
            aria-label="Collapse sidebar"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* --- Main Nav --- */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-3 px-2">
        <div className="space-y-0.5">
          {NAV_MAIN.map((item) => {
            const Icon = item.icon;
            const active = isActive(item);

            return (
              <Link
                key={item.href}
                href={item.href}
                title={collapsed ? item.label : undefined}
                className={cn(
                  'group relative flex items-center gap-3 rounded-lg transition-all duration-150',
                  collapsed ? 'h-10 w-10 mx-auto justify-center' : 'h-9 px-3',
                  active
                    ? 'nav-item-active bg-primary/10 text-primary font-medium'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted',
                )}
                aria-current={active ? 'page' : undefined}
              >
                <Icon
                  className={cn('shrink-0 h-4 w-4', active ? 'text-primary' : '')}
                  strokeWidth={active ? 2 : 1.5}
                />
                {!collapsed && (
                  <>
                    <span className="flex-1 truncate text-sm">{item.label}</span>
                    <span className="ml-auto hidden text-[10px] text-muted-foreground group-hover:inline-flex opacity-0 group-hover:opacity-70 transition-opacity duration-150">
                      {item.shortcut}
                    </span>
                    {item.badge && (
                      <span className="ml-auto flex h-4 min-w-4 items-center justify-center rounded-full bg-primary/15 px-1 text-[10px] font-medium text-primary">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </Link>
            );
          })}
        </div>

        {/* Section divider */}
        {!collapsed && (
          <div className="my-4 border-t border-border" />
        )}
        {collapsed && <div className="my-3" />}

        {/* Bottom nav items */}
        <div className="space-y-0.5">
          {NAV_BOTTOM.map((item) => {
            const Icon = item.icon;
            const active = isActive(item);

            return (
              <Link
                key={item.href}
                href={item.href}
                title={collapsed ? item.label : undefined}
                className={cn(
                  'group relative flex items-center gap-3 rounded-lg transition-all duration-150',
                  collapsed ? 'h-10 w-10 mx-auto justify-center' : 'h-9 px-3',
                  active
                    ? 'nav-item-active bg-primary/10 text-primary font-medium'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted',
                )}
                aria-current={active ? 'page' : undefined}
              >
                <Icon
                  className={cn('shrink-0 h-4 w-4', active ? 'text-primary' : '')}
                  strokeWidth={active ? 2 : 1.5}
                />
                {!collapsed && (
                  <>
                    <span className="flex-1 truncate text-sm">{item.label}</span>
                    <span className="hidden text-[10px] text-muted-foreground group-hover:inline-flex opacity-0 group-hover:opacity-70 transition-opacity duration-150">
                      {item.shortcut}
                    </span>
                  </>
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* --- User Menu --- */}
      <div className="shrink-0 border-t border-sidebar-border p-2">
        <div className="relative">
          <button
            onClick={() => setUserMenuOpen((v) => !v)}
            className={cn(
              'w-full flex items-center gap-3 rounded-lg p-2 text-left',
              'hover:bg-muted transition-colors duration-150',
              collapsed && 'justify-center',
            )}
            aria-label="User menu"
            aria-expanded={userMenuOpen}
          >
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary text-xs font-bold">
              CM
            </div>
            {!collapsed && (
              <>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-xs font-medium text-foreground leading-none">
                    Caleb M.
                  </p>
                  <p className="truncate text-[10px] text-muted-foreground mt-0.5">
                    caleb@agency.com
                  </p>
                </div>
                <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              </>
            )}
          </button>

          {/* Dropdown */}
          {userMenuOpen && !collapsed && (
            <div
              className={cn(
                'absolute bottom-full left-0 right-0 mb-1 z-20',
                'rounded-xl border border-border bg-card shadow-elevated py-1',
                'animate-scale-in',
              )}
            >
              <button
                className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors duration-150"
                onClick={() => setUserMenuOpen(false)}
              >
                <User className="h-3.5 w-3.5" />
                Account settings
              </button>
              <button
                className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors duration-150"
                onClick={() => setUserMenuOpen(false)}
              >
                <Building2 className="h-3.5 w-3.5" />
                Switch workspace
              </button>
              <div className="my-1 border-t border-border" />
              <button
                className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors duration-150"
                onClick={() => setUserMenuOpen(false)}
              >
                <LogOut className="h-3.5 w-3.5" />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>

      {/* --- Expand button (when collapsed) --- */}
      {collapsed && (
        <button
          onClick={() => setCollapsed(false)}
          className="absolute top-[60px] -right-3 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-card shadow-card text-muted-foreground hover:text-foreground transition-colors duration-150"
          aria-label="Expand sidebar"
        >
          <ChevronRight className="h-3 w-3" />
        </button>
      )}
    </aside>
  );
}

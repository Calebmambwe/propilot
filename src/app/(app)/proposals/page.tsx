'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Plus,
  Search,
  ArrowUpDown,
  MoreHorizontal,
  ExternalLink,
  Pencil,
  Archive,
  CheckCircle2,
  XCircle,
  FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const DEMO_PROPOSALS = [
  { id: '1', title: 'Website Redesign Proposal', client: 'Acme Corp', status: 'sent', value: 12000, date: 'Mar 21, 2025', views: 4 },
  { id: '2', title: 'SEO Audit & Strategy', client: 'TechStart Inc', status: 'won', value: 8500, date: 'Mar 19, 2025', views: 7 },
  { id: '3', title: 'Brand Identity Package', client: 'GreenLeaf Co', status: 'viewed', value: 15000, date: 'Mar 17, 2025', views: 3 },
  { id: '4', title: 'Mobile App Development', client: 'FinServ Ltd', status: 'lost', value: 45000, date: 'Mar 15, 2025', views: 12 },
  { id: '5', title: 'Marketing Automation Setup', client: 'CloudNine SaaS', status: 'draft', value: 6000, date: 'Mar 14, 2025', views: 0 },
  { id: '6', title: 'E-commerce Platform Migration', client: 'RetailMax', status: 'sent', value: 22000, date: 'Mar 12, 2025', views: 2 },
  { id: '7', title: 'Data Analytics Dashboard', client: 'DataViz Pro', status: 'won', value: 18000, date: 'Mar 10, 2025', views: 9 },
];

type Status = 'all' | 'draft' | 'sent' | 'viewed' | 'won' | 'lost';

const TABS: { label: string; value: Status; count?: number }[] = [
  { label: 'All', value: 'all', count: DEMO_PROPOSALS.length },
  { label: 'Drafts', value: 'draft', count: 1 },
  { label: 'Sent', value: 'sent', count: 2 },
  { label: 'Won', value: 'won', count: 2 },
  { label: 'Lost', value: 'lost', count: 1 },
];

const STATUS_CLASSES: Record<string, string> = {
  won: 'status-won',
  sent: 'status-sent',
  viewed: 'status-viewed',
  lost: 'status-lost',
  draft: 'status-draft',
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
        STATUS_CLASSES[status] ?? 'status-draft',
      )}
    >
      {status}
    </span>
  );
}

function formatCurrency(v: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v);
}

interface ActionMenuProps {
  proposalId: string;
  status: string;
}

function ActionMenu({ proposalId, status }: ActionMenuProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }}
        className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors duration-150"
        aria-label="Row actions"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} aria-hidden />
          <div className="absolute right-0 top-8 z-20 w-44 rounded-xl border border-border bg-card shadow-elevated py-1 animate-scale-in">
            <Link
              href={`/proposals/${proposalId}/edit`}
              className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors duration-150"
              onClick={() => setOpen(false)}
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit proposal
            </Link>
            <Link
              href={`/proposals/${proposalId}/edit`}
              className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors duration-150"
              onClick={() => setOpen(false)}
            >
              <ExternalLink className="h-3.5 w-3.5" />
              View live
            </Link>
            {status !== 'won' && (
              <button
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-success hover:bg-success/10 transition-colors duration-150"
                onClick={() => setOpen(false)}
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                Mark as won
              </button>
            )}
            {status !== 'lost' && (
              <button
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors duration-150"
                onClick={() => setOpen(false)}
              >
                <XCircle className="h-3.5 w-3.5" />
                Mark as lost
              </button>
            )}
            <div className="my-1 border-t border-border" />
            <button
              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors duration-150"
              onClick={() => setOpen(false)}
            >
              <Archive className="h-3.5 w-3.5" />
              Archive
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default function ProposalsPage() {
  const [activeTab, setActiveTab] = useState<Status>('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [sortField, setSortField] = useState<'date' | 'value' | 'title'>('date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const filtered = DEMO_PROPOSALS.filter((p) => {
    const matchesTab = activeTab === 'all' || p.status === activeTab;
    const matchesSearch =
      search === '' ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.client.toLowerCase().includes(search.toLowerCase());
    return matchesTab && matchesSearch;
  }).sort((a, b) => {
    const dir = sortDir === 'asc' ? 1 : -1;
    if (sortField === 'value') return (a.value - b.value) * dir;
    if (sortField === 'title') return a.title.localeCompare(b.title) * dir;
    return a.date.localeCompare(b.date) * dir;
  });

  function toggleSort(field: typeof sortField) {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  }

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (selected.size === filtered.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map((p) => p.id)));
    }
  }

  return (
    <div className="space-y-5 max-w-7xl animate-fade-in">
      {/* ---- Page header ---- */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-foreground tracking-tight">Proposals</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {DEMO_PROPOSALS.length} proposals &middot; $126.5k total pipeline
          </p>
        </div>
        <Button size="sm" className="gap-1.5 rounded-lg shrink-0" asChild>
          <Link href="/proposals/new">
            <Plus className="h-3.5 w-3.5" />
            New Proposal
          </Link>
        </Button>
      </div>

      {/* ---- Tabs + Search ---- */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        {/* Status tabs */}
        <div className="flex items-center gap-0.5 rounded-lg border border-border bg-muted/50 p-0.5">
          {TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={cn(
                'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all duration-150',
                activeTab === tab.value
                  ? 'bg-card text-foreground shadow-card'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {tab.label}
              {tab.count !== undefined && (
                <span
                  className={cn(
                    'flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px]',
                    activeTab === tab.value
                      ? 'bg-primary/15 text-primary'
                      : 'bg-muted text-muted-foreground',
                  )}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative flex-1 max-w-xs ml-auto">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search proposals..."
            className="pl-9 h-8 text-sm rounded-lg"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search proposals"
          />
        </div>
      </div>

      {/* ---- Bulk actions bar ---- */}
      {selected.size > 0 && (
        <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/50 px-4 py-2.5 animate-scale-in">
          <span className="text-sm font-medium text-foreground">{selected.size} selected</span>
          <div className="flex items-center gap-2 ml-2">
            <Button variant="outline" size="sm" className="h-7 text-xs gap-1.5">
              <CheckCircle2 className="h-3 w-3 text-success" />
              Mark Won
            </Button>
            <Button variant="outline" size="sm" className="h-7 text-xs gap-1.5">
              <XCircle className="h-3 w-3 text-destructive" />
              Mark Lost
            </Button>
            <Button variant="outline" size="sm" className="h-7 text-xs gap-1.5">
              <Archive className="h-3 w-3" />
              Archive
            </Button>
          </div>
          <button
            onClick={() => setSelected(new Set())}
            className="ml-auto text-xs text-muted-foreground hover:text-foreground transition-colors duration-150"
          >
            Clear
          </button>
        </div>
      )}

      {/* ---- Table ---- */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card py-16 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-4">
            <FileText className="h-6 w-6 text-muted-foreground" strokeWidth={1.5} />
          </div>
          <p className="text-sm font-medium text-foreground">No proposals found</p>
          <p className="text-xs text-muted-foreground mt-1">
            {search ? 'Try a different search term' : 'Create your first proposal to get started'}
          </p>
          {!search && (
            <Button size="sm" className="mt-4 gap-1.5" asChild>
              <Link href="/proposals/new">
                <Plus className="h-3.5 w-3.5" />
                New Proposal
              </Link>
            </Button>
          )}
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-[auto_1fr_auto_auto_auto_auto] items-center gap-3 border-b border-border bg-muted/30 px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={selected.size === filtered.length && filtered.length > 0}
                onChange={toggleAll}
                className="h-3.5 w-3.5 rounded border-border accent-primary"
                aria-label="Select all"
              />
            </div>
            <button
              className="flex items-center gap-1 text-left hover:text-foreground transition-colors duration-150"
              onClick={() => toggleSort('title')}
            >
              Proposal
              <ArrowUpDown className="h-3 w-3" />
            </button>
            <span className="hidden sm:block">Status</span>
            <button
              className="hidden sm:flex items-center gap-1 hover:text-foreground transition-colors duration-150"
              onClick={() => toggleSort('value')}
            >
              Value
              <ArrowUpDown className="h-3 w-3" />
            </button>
            <span className="hidden md:block">Views</span>
            <button
              className="hidden md:flex items-center gap-1 hover:text-foreground transition-colors duration-150"
              onClick={() => toggleSort('date')}
            >
              Date
              <ArrowUpDown className="h-3 w-3" />
            </button>
            <span className="w-7" />
          </div>

          {/* Rows */}
          <div className="divide-y divide-border">
            {filtered.map((p) => (
              <div
                key={p.id}
                className={cn(
                  'grid grid-cols-[auto_1fr_auto_auto_auto_auto] items-center gap-3 px-4 py-3',
                  'hover:bg-muted/20 transition-colors duration-150 group',
                  selected.has(p.id) && 'bg-primary/5',
                )}
              >
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selected.has(p.id)}
                    onChange={() => toggleSelect(p.id)}
                    className="h-3.5 w-3.5 rounded border-border accent-primary"
                    aria-label={`Select ${p.title}`}
                  />
                </div>

                <div className="min-w-0">
                  <Link
                    href={`/proposals/${p.id}/edit`}
                    className="text-sm font-medium text-foreground hover:text-primary transition-colors duration-150 truncate block"
                  >
                    {p.title}
                  </Link>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">{p.client}</p>
                </div>

                <div className="hidden sm:block">
                  <StatusBadge status={p.status} />
                </div>

                <div className="hidden sm:block text-sm font-medium text-foreground tabular-nums">
                  {formatCurrency(p.value)}
                </div>

                <div className="hidden md:block text-xs text-muted-foreground tabular-nums">
                  {p.views > 0 ? `${p.views}×` : '—'}
                </div>

                <div className="hidden md:block text-xs text-muted-foreground">
                  {p.date}
                </div>

                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                  <ActionMenu proposalId={p.id} status={p.status} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

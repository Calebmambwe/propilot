'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Plus, Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';

const DEMO_PROPOSALS = [
  { id: '1', title: 'Website Redesign Proposal', client_name: 'Acme Corp', status: 'sent', deal_value: 12000, created_at: '2025-03-21' },
  { id: '2', title: 'SEO Audit & Strategy', client_name: 'TechStart Inc', status: 'won', deal_value: 8500, created_at: '2025-03-19' },
  { id: '3', title: 'Brand Identity Package', client_name: 'GreenLeaf Co', status: 'viewed', deal_value: 15000, created_at: '2025-03-17' },
  { id: '4', title: 'Mobile App Development', client_name: 'FinServ Ltd', status: 'lost', deal_value: 45000, created_at: '2025-03-15' },
  { id: '5', title: 'Marketing Automation Setup', client_name: 'CloudNine SaaS', status: 'draft', deal_value: 6000, created_at: '2025-03-14' },
  { id: '6', title: 'E-commerce Platform Migration', client_name: 'RetailMax', status: 'sent', deal_value: 22000, created_at: '2025-03-12' },
  { id: '7', title: 'Data Analytics Dashboard', client_name: 'DataViz Pro', status: 'won', deal_value: 18000, created_at: '2025-03-10' },
];

const statusColors: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  won: 'default',
  sent: 'secondary',
  viewed: 'secondary',
  lost: 'destructive',
  draft: 'outline',
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
}

export default function ProposalsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Proposals</h1>
          <p className="text-muted-foreground">
            Manage and track all your proposals
          </p>
        </div>
        <Button asChild>
          <Link href="/proposals/new">
            <Plus className="mr-2 h-4 w-4" />
            New Proposal
          </Link>
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search proposals..." className="pl-9" />
        </div>
        <Button variant="outline" size="sm">
          <Filter className="mr-2 h-4 w-4" />
          Filter
        </Button>
      </div>

      <div className="space-y-3">
        {DEMO_PROPOSALS.map((proposal) => (
          <Card key={proposal.id} className="hover:shadow-md transition-shadow">
            <CardContent className="flex items-center justify-between py-4">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <Link
                    href={`/proposals/${proposal.id}/edit`}
                    className="font-semibold hover:underline text-lg"
                  >
                    {proposal.title}
                  </Link>
                  <Badge variant={statusColors[proposal.status] ?? 'secondary'}>
                    {proposal.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {proposal.client_name} &middot; {formatCurrency(proposal.deal_value)} &middot; Created {proposal.created_at}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/proposals/${proposal.id}/edit`}>Edit</Link>
                </Button>
                {proposal.status === 'draft' && (
                  <Button size="sm">Send</Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

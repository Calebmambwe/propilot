'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FileText, TrendingUp, DollarSign, Trophy } from 'lucide-react';

const DEMO_PROPOSALS = [
  { id: '1', title: 'Website Redesign Proposal', client_name: 'Acme Corp', status: 'sent', created_at: '2 hours ago' },
  { id: '2', title: 'SEO Audit & Strategy', client_name: 'TechStart Inc', status: 'won', created_at: '1 day ago' },
  { id: '3', title: 'Brand Identity Package', client_name: 'GreenLeaf Co', status: 'viewed', created_at: '3 days ago' },
  { id: '4', title: 'Mobile App Development', client_name: 'FinServ Ltd', status: 'lost', created_at: '5 days ago' },
  { id: '5', title: 'Marketing Automation Setup', client_name: 'CloudNine SaaS', status: 'draft', created_at: '1 week ago' },
];

const statusColors: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  won: 'default',
  sent: 'secondary',
  viewed: 'secondary',
  lost: 'destructive',
  draft: 'outline',
};

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Your proposal performance at a glance
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Proposals</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">42%</div>
            <p className="text-xs text-muted-foreground">8 won / 19 decided</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Deal Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$8,450</div>
            <p className="text-xs text-muted-foreground">Won proposals</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Proposals Won</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">+3 from last month</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Proposals</CardTitle>
          <Button variant="outline" size="sm" asChild>
            <Link href="/proposals">View all</Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {DEMO_PROPOSALS.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between py-2 border-b last:border-0"
              >
                <div>
                  <Link
                    href={`/proposals/${p.id}/edit`}
                    className="font-medium hover:underline"
                  >
                    {p.title}
                  </Link>
                  <p className="text-sm text-muted-foreground">
                    {p.client_name} &middot; {p.created_at}
                  </p>
                </div>
                <Badge variant={statusColors[p.status] ?? 'secondary'}>
                  {p.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

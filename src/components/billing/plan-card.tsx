'use client';

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTRPC } from '@/trpc/client';
import { useMutation } from '@tanstack/react-query';
import type { OrgPlan } from '@/types/domain';

// Accept string[] from existing pages — converts them to features with all included
interface PlanCardProps {
  plan: OrgPlan;
  name: string;
  price: number;
  features: string[];
  isCurrentPlan: boolean;
  isPopular?: boolean;
  orgId?: string;
}

export function PlanCard({
  plan,
  name,
  price,
  features,
  isCurrentPlan,
  isPopular,
  orgId,
}: PlanCardProps) {
  const trpc = useTRPC();

  const createCheckout = useMutation(
    trpc.billing.createCheckoutSession.mutationOptions(),
  );

  function handleSelect() {
    if (!orgId || isCurrentPlan) return;
    const successUrl = `${window.location.origin}/settings/billing?success=1`;
    const cancelUrl = `${window.location.origin}/settings/billing`;
    createCheckout.mutate({ orgId, plan, successUrl, cancelUrl });
  }

  return (
    <Card
      className={cn(
        'relative flex flex-col',
        isPopular && 'border-primary shadow-md',
        isCurrentPlan && 'bg-muted/30',
      )}
    >
      {isPopular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Badge className="px-3 py-0.5 text-xs">Most Popular</Badge>
        </div>
      )}

      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{name}</CardTitle>
          {isCurrentPlan && (
            <Badge variant="outline" className="text-xs">
              Current
            </Badge>
          )}
        </div>
        <div className="flex items-baseline gap-1 pt-1">
          <span className="text-3xl font-bold">${price}</span>
          <span className="text-sm text-muted-foreground">/month</span>
        </div>
      </CardHeader>

      <CardContent className="flex-1">
        <ul className="space-y-2">
          {features.map((feature, i) => (
            <li key={i} className="flex items-start gap-2 text-sm">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              {feature}
            </li>
          ))}
        </ul>
      </CardContent>

      <CardFooter className="pt-4">
        <Button
          className="w-full"
          variant={isCurrentPlan ? 'outline' : isPopular ? 'default' : 'outline'}
          onClick={handleSelect}
          disabled={isCurrentPlan || createCheckout.isPending || !orgId}
        >
          {isCurrentPlan
            ? 'Current plan'
            : createCheckout.isPending
              ? 'Loading...'
              : `Upgrade to ${name}`}
        </Button>
      </CardFooter>
    </Card>
  );
}

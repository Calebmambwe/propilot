'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Accepts both { date, winRate, count } from pages and { period, proposals, winRate } from hooks
interface WinRateDataPoint {
  date?: string;
  period?: string;
  winRate: number;
  count?: number;
  proposals?: number;
}

interface WinRateChartProps {
  data: WinRateDataPoint[];
  title?: string;
}

interface TooltipPayload {
  value: number;
  name: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-lg border bg-background p-3 shadow-md text-sm">
      <p className="font-medium mb-1">{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} className="text-muted-foreground">
          {entry.name === 'winRate' ? 'Win rate' : 'Proposals'}:{' '}
          <span className="font-medium text-foreground">
            {entry.name === 'winRate' ? `${entry.value.toFixed(1)}%` : entry.value}
          </span>
        </p>
      ))}
    </div>
  );
}

export function WinRateChart({ data, title = 'Win Rate Over Time' }: WinRateChartProps) {
  // Normalize data key — pages use 'date', hooks use 'period'
  const chartData = data.map((d) => ({
    ...d,
    label: d.date ?? d.period ?? '',
    winRate: d.winRate,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="winRateGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v: number) => `${v}%`}
              domain={[0, 100]}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="winRate"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              fill="url(#winRateGradient)"
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

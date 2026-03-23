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
  height?: number;
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
    <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-elevated text-xs">
      <p className="font-medium text-foreground mb-1">{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} className="text-muted-foreground">
          {entry.name === 'winRate' ? 'Win rate' : 'Proposals'}:{' '}
          <span className="font-semibold text-foreground">
            {entry.name === 'winRate' ? `${entry.value.toFixed(1)}%` : entry.value}
          </span>
        </p>
      ))}
    </div>
  );
}

export function WinRateChart({ data, height = 240 }: WinRateChartProps) {
  const chartData = data.map((d) => ({
    ...d,
    label: d.date ?? d.period ?? '',
  }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <defs>
          <linearGradient id="winRateGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
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
        <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'hsl(var(--border))', strokeWidth: 1 }} />
        <Area
          type="monotone"
          dataKey="winRate"
          stroke="hsl(var(--primary))"
          strokeWidth={2}
          fill="url(#winRateGradient)"
          dot={false}
          activeDot={{ r: 4, strokeWidth: 0, fill: 'hsl(var(--primary))' }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

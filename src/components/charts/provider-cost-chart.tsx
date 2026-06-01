
'use client';

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid } from 'recharts';
import { ChartTooltipContent, ChartContainer, ChartTooltip } from '@/components/ui/chart';

/**
 * OS CORE: Intelligence Consumption Chart
 * SECURITY RULE: Generic terminology used for provider names (Intelligence Nodes).
 */
const chartConfig = {
    cost: {
      label: "Unit Cost (USD)",
      color: "hsl(var(--primary))",
    },
} satisfies import("@/components/ui/chart").ChartConfig;


export function ProviderCostChart({ data }: { data: {name: string, cost: number}[] }) {
  return (
    <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
        <BarChart accessibilityLayer data={data} margin={{ left: 12, right: 12 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.1} />
            <XAxis
                dataKey="name"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                fontSize={10}
                fontWeight="bold"
            />
            <YAxis
                tickFormatter={(value) => `$${value.toFixed(0)}`}
                fontSize={10}
                axisLine={false}
                tickLine={false}
            />
            <ChartTooltip
                cursor={{ fill: 'hsl(var(--secondary))', opacity: 0.2 }}
                content={<ChartTooltipContent indicator="dot" formatter={(value) => `$${Number(value).toFixed(2)}`} />}
            />
            <Bar dataKey="cost" fill="var(--color-cost)" radius={[4, 4, 0, 0]} />
        </BarChart>
    </ChartContainer>
  );
}

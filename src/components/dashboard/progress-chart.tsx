'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface ProgressChartProps {
    data: { date: string; calories: number }[];
}

const chartConfig = {
  calories: {
    label: "Calories",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

export default function ProgressChart({ data }: ProgressChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-6 h-6" />
            <span>Calorie Burn Progress</span>
        </CardTitle>
        <CardDescription>Your calories burned over the last 7 activities.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <ResponsiveContainer>
            <LineChart
              accessibilityLayer
              data={data}
              margin={{
                top: 5,
                right: 20,
                left: 10,
                bottom: 5,
              }}
            >
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => format(parseISO(value), 'MMM d')}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                width={35}
                domain={['dataMin - 50', 'dataMax + 50']}
              />
              <Tooltip
                cursor={{ strokeDasharray: '3 3' }}
                content={<ChartTooltipContent indicator="dot" />}
              />
              <Line
                dataKey="calories"
                type="monotone"
                stroke="var(--color-calories)"
                strokeWidth={2}
                dot={{
                  fill: "var(--color-calories)",
                  r: 4,
                }}
                activeDot={{
                  r: 6,
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

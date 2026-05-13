"use client"

import { Card } from "@chowvest/ui"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@chowvest/ui"

const chartData = [
  { month: "Jan", savings: 15000 },
  { month: "Feb", savings: 22000 },
  { month: "Mar", savings: 28000 },
  { month: "Apr", savings: 35000 },
  { month: "May", savings: 42000 },
  { month: "Jun", savings: 48000 },
]

const chartConfig = {
  savings: {
    label: "Savings",
    color: "hsl(var(--primary))",
  },
}

export function SavingsChart() {
  return (
    <Card className="p-6">
      <div className="space-y-2 mb-6">
        <h3 className="text-xl font-semibold text-foreground">Food Progress</h3>
        <p className="text-sm text-muted-foreground">Your monthly food savings growth</p>
      </div>
      <ChartContainer config={chartConfig} className="h-[300px] w-full">
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="fillSavings" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            dataKey="month"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            stroke="hsl(var(--muted-foreground))"
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            stroke="hsl(var(--muted-foreground))"
            tickFormatter={(value) => `₦${value / 1000}k`}
          />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Area
            type="monotone"
            dataKey="savings"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            fill="url(#fillSavings)"
          />
        </AreaChart>
      </ChartContainer>
    </Card>
  )
}

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@chowvest/ui";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";

const PIE_COLORS = ["#22c55e","#3b82f6","#f59e0b","#ef4444","#8b5cf6","#14b8a6"];

interface OverviewChartsProps {
  signupData: { day: string; count: number }[];
  commodityData: { name: string; value: number }[];
}

export function OverviewCharts({ signupData, commodityData }: OverviewChartsProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Signups bar chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">New Signups — Last 7 Days</CardTitle>
        </CardHeader>
        <CardContent>
          {signupData.length === 0 ? (
            <p className="text-muted-foreground text-sm py-8 text-center">No signups in the last 7 days.</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={signupData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="count" name="Signups" fill="#22c55e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Active goals by commodity pie chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Active Goals by Commodity</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center">
          {commodityData.length === 0 ? (
            <p className="text-muted-foreground text-sm py-8 text-center">No active goals.</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={commodityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {commodityData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: 12,
                  }}
                />
                <Legend
                  iconSize={10}
                  wrapperStyle={{ fontSize: 11 }}
                  formatter={(v) => <span className="capitalize">{v}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

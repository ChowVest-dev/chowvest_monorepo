"use client";
import { Card } from "@chowvest/ui";
import { Target, TrendingUp, Award, Calendar } from "lucide-react";

interface ProfileStatsProps {
  completedHarvests: number;
  totalSaved: number;
  createdAt?: string;
}

export function ProfileStats({
  completedHarvests,
  totalSaved,
  createdAt,
}: ProfileStatsProps) {
  const stats = [
    {
      label: "Harvests Completed",
      value: completedHarvests.toString(),
      icon: Target,
    },
    {
      label: "Total Saved",
      value: `₦${totalSaved.toLocaleString()}`,
      icon: TrendingUp,
    },
    {
      label: "Member Since",
      value: createdAt
        ? new Date(createdAt).toLocaleDateString("en-US", {
            month: "short",
            year: "numeric",
          })
        : "—",
      icon: Calendar,
    },
    {
      label: "Achievements",
      value: "0", // Placeholder for now
      icon: Award,
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.label} className="p-4 text-center">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
              <Icon className="w-6 h-6 text-primary" />
            </div>
            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
          </Card>
        );
      })}
    </div>
  );
}

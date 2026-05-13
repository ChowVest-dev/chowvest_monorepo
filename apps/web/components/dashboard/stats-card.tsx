import { Card } from "@chowvest/ui";
import { Wallet, TrendingUp, Target } from "lucide-react";

interface StatsCardsProps {
  walletBalance: number;
  totalSavings: number;
  activeGoalsCount: number;
}

export function StatsCards({
  walletBalance,
  totalSavings,
  activeGoalsCount,
}: StatsCardsProps) {
  const stats = [
    {
      label: "Total Saved",
      value: `₦${totalSavings.toLocaleString()}`,
      change: "Funds secured for your foodstock.",
      icon: TrendingUp,
      trend: "up",
    },
    {
      label: "Wallet Balance",
      value: `₦${walletBalance.toLocaleString()}`,
      change: "Ready to top up your baskets.",
      icon: Wallet,
      trend: "neutral",
    },
    {
      label: "Active Baskets",
      value: activeGoalsCount.toString(),
      change: "Baskets you're currently filling.",
      icon: Target,
      trend: "up",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card
            key={stat.label}
            className="p-6 bg-gradient-to-br from-card to-accent/20 border-border/50"
            {...(stat.label === "Wallet Balance"
              ? { "data-onboarding-id": "wallet-balance" }
              : stat.label === "Total Saved"
              ? { "data-onboarding-id": "total-saved" }
              : {})}
          >
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-3xl font-bold text-foreground">
                  {stat.value}
                </p>
                <p
                  className={`text-sm ${
                    stat.trend === "up"
                      ? "text-primary"
                      : "text-muted-foreground"
                  }`}
                >
                  {stat.change}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Icon className="w-6 h-6 text-primary" />
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

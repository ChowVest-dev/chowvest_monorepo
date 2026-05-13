"use client";

import { DashboardHeader } from "@/components/dashboard/header";
import { StatsCards } from "@/components/dashboard/stats-card";
import { ActiveGoals } from "@/components/dashboard/active-goals";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { ActiveDeliveryTracker } from "@/components/dashboard/active-delivery-tracker";
import { useSession } from "@/components/providers/session-provider";

interface Basket {
  id: string;
  name: string;
  goalAmount: number;
  currentAmount: number;
  image: string | null;
  commodityType: string | null;
  category: string;
}

interface DashboardClientProps {
  walletBalance: number;
  totalSavings: number;
  baskets: Basket[];
  activeDeliveries?: any[];
}

export function DashboardClient({
  walletBalance,
  totalSavings,
  baskets,
  activeDeliveries = [],
}: DashboardClientProps) {
  const session = useSession();

  if (!session?.user) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 md:px-6 space-y-6 pt-4 md:pt-20 pb-24 md:pb-8 mt-2 md:mt-6">
      <DashboardHeader user={session.user} />
      
      {activeDeliveries.length > 0 && (
        <ActiveDeliveryTracker deliveries={activeDeliveries} />
      )}

      <StatsCards
        walletBalance={walletBalance}
        totalSavings={totalSavings}
        activeGoalsCount={baskets.length}
      />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ActiveGoals baskets={baskets} />
        </div>
        <div>
          <QuickActions />
        </div>
      </div>
    </div>
  );
}

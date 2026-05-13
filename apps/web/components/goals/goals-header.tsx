"use client";

import { Target, Package, Truck, ChevronRight, ShoppingBasket } from "lucide-react";
import { Button } from "@chowvest/ui";
import { Badge } from "@chowvest/ui";
import Link from "next/link";

interface GoalsHeaderProps {
  completedGoalsCount?: number;
  activeDeliveriesCount?: number;
  onViewDeliveries?: () => void;
}

export function GoalsHeader({
  completedGoalsCount = 0,
  activeDeliveriesCount = 0,
  onViewDeliveries,
}: GoalsHeaderProps) {
  const hasActivity = completedGoalsCount > 0 || activeDeliveriesCount > 0;

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-2" data-onboarding-id="goals-header">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center shadow-inner">
          <ShoppingBasket className="w-7 h-7 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">
            My Baskets
          </h1>
          <p className="text-muted-foreground mt-0.5 font-medium">
            Lock in prices and fill your basket
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 w-full sm:w-auto">
        {hasActivity ? (
          <Button
            onClick={onViewDeliveries}
            className="flex-1 sm:flex-none h-12 gap-3 px-5 bg-green-600 hover:bg-green-700 text-white rounded-xl shadow-md transition-all active:scale-95"
          >
            <div className="flex items-center gap-2">
              <Truck className="w-5 h-5" />
              <span className="font-bold">Deliveries</span>
            </div>
            
            <div className="flex items-center gap-1.5 ml-1">
              {completedBasketsCountBadge(completedGoalsCount)}
              {activeDeliveriesCountBadge(activeDeliveriesCount)}
            </div>
          </Button>
        ) : (
          <Link href="/deliveries" className="flex-1 sm:flex-none">
            <Button
              variant="outline"
              className="w-full h-12 gap-2 px-5 border-border hover:bg-muted text-muted-foreground rounded-xl"
            >
              <Truck className="w-4 h-4" />
              <span className="font-semibold">All Deliveries</span>
              <ChevronRight className="w-4 h-4 ml-1 opacity-50" />
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}

function completedBasketsCountBadge(count: number) {
  if (count === 0) return null;
  return (
    <div className="flex items-center gap-1 bg-white/20 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tighter">
      <span>Ready</span>
      <span className="bg-white text-green-600 w-4 h-4 rounded-full flex items-center justify-center">
        {count}
      </span>
    </div>
  );
}

function activeDeliveriesCountBadge(count: number) {
  if (count === 0) return null;
  return (
    <div className="flex items-center gap-1 bg-blue-500/30 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tighter border border-blue-400/30 animate-pulse">
      <span className="text-blue-100">Active</span>
      <span className="bg-blue-500 text-white w-4 h-4 rounded-full flex items-center justify-center">
        {count}
      </span>
    </div>
  );
}

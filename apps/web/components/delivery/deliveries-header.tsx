"use client";

import { Truck } from "lucide-react";

export function DeliveriesHeader() {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4" data-onboarding-id="deliveries-header">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
          <Truck className="w-7 h-7 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground text-balance">
            My Deliveries
          </h1>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">
            Track your active orders and view past delivery history
          </p>
        </div>
      </div>
    </div>
  );
}

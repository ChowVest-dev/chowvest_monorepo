"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@chowvest/ui";
import { DeliveryStatusChanger, AssignLogisticsDropdown } from "./client-components";

const KANBAN_STATUSES = [
  { key: "PENDING",     label: "Awaiting Dispatch", color: "border-slate-300 bg-slate-50" },
  { key: "CONFIRMED",   label: "Rider at Pickup",   color: "border-yellow-400 bg-yellow-50" },
  { key: "PREPARING",   label: "Items Picked Up",   color: "border-blue-400 bg-blue-50" },
  { key: "IN_TRANSIT",  label: "In Transit",        color: "border-orange-400 bg-orange-50" },
  { key: "AT_CUSTOMER", label: "Rider Arrived",     color: "border-green-400 bg-green-50" },
];

interface Delivery {
  id: string;
  status: string;
  deliveryOption: string;
  address: string;
  addressLabel: string | null;
  requestedAt: Date | string;
  basket: { name: string; commodityType: string | null } | null;
  logisticsCompanyId?: string | null;
  logisticsCompany?: { name: string } | null;
  rider?: { fullName: string; phoneNumber: string } | null;
}

export function KanbanBoard({ deliveries, companies }: { deliveries: Delivery[], companies: any[] }) {
  const router = useRouter();

  useEffect(() => {
    const interval = setInterval(() => router.refresh(), 10000);
    return () => clearInterval(interval);
  }, [router]);

  const byStatus = (status: string) => deliveries.filter((d) => d.status === status);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 overflow-x-auto pb-4">
      {KANBAN_STATUSES.map(({ key, label, color }) => {
        const items = byStatus(key);
        return (
          <div key={key} className={`rounded-xl border-2 ${color} p-3 space-y-3 min-h-[200px]`}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</span>
              <span className="text-xs rounded-full bg-muted px-2 py-0.5 font-mono">{items.length}</span>
            </div>

            {items.length === 0 && (
              <p className="text-xs text-muted-foreground text-center pt-6">No deliveries</p>
            )}

            {items.map((d) => (
              <Card key={d.id} className="shadow-none border rounded-lg overflow-hidden">
                <CardContent className="p-3 space-y-3">
                  <div className="font-medium text-sm truncate">{d.basket?.name || "Food Items"}</div>
                  <div className="text-[10px] text-muted-foreground truncate" title={d.address}>
                    📍 {d.addressLabel ? `${d.addressLabel} — ` : ""}{d.address}
                  </div>
                  
                  <div className="space-y-2 pt-1">
                    <AssignLogisticsDropdown 
                      deliveryId={d.id} 
                      companies={companies} 
                      currentCompanyId={d.logisticsCompanyId} 
                    />
                    
                    {d.logisticsCompany && (
                      <div className="text-[10px] bg-muted/50 p-2 rounded-md border">
                        <div className="font-bold text-primary mb-0.5">{d.logisticsCompany.name}</div>
                        <div className="text-muted-foreground">
                          {d.rider ? `${d.rider.fullName} (${d.rider.phoneNumber})` : "Awaiting Rider..."}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t flex flex-col gap-2">
                    <div className="text-[10px] text-muted-foreground font-mono">
                      {new Date(d.requestedAt).toLocaleString()}
                    </div>
                    <DeliveryStatusChanger deliveryId={d.id} currentStatus={d.status} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        );
      })}
    </div>
  );
}

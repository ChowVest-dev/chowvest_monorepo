"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { DeliveryCard } from "./delivery-card";
import { PackageOpen } from "lucide-react";
import type { SerializedDelivery, SerializedReadyBasket } from "./types";
import { Card } from "@chowvest/ui";
import { Button } from "@chowvest/ui";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface DeliveriesWrapperProps {
  deliveries: SerializedDelivery[];
  readyBaskets?: SerializedReadyBasket[];
}

function DeliveriesContent({ deliveries, readyBaskets = [] }: DeliveriesWrapperProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const getInitialTab = () => {
    const t = searchParams.get("tab");
    if (t === "PAST") return "PAST";
    if (t === "READY") return "READY";
    return "ACTIVE";
  };
  const [tab, setTab] = useState<"ACTIVE" | "PAST" | "READY">(getInitialTab());

  const activeStatuses = ["PENDING", "CONFIRMED", "PREPARING", "IN_TRANSIT"];
  const pastStatuses = ["DELIVERED", "CANCELLED"];

  const activeDeliveries = deliveries.filter((d) => activeStatuses.includes(d.status));
  const pastDeliveries = deliveries.filter((d) => pastStatuses.includes(d.status));

  const displayList = tab === "ACTIVE" ? activeDeliveries : pastDeliveries;

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex bg-muted/30 p-1 w-full max-w-md rounded-[10px] border border-border">
        <button
          onClick={() => setTab("ACTIVE")}
          className={`flex-1 py-2 text-sm font-bold rounded-[8px] transition-all flex items-center justify-center gap-2 ${
            tab === "ACTIVE"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          }`}
        >
          Active Orders
          {activeDeliveries.length > 0 && (
             <span className="bg-primary text-primary-foreground text-[10px] px-2 py-0.5 rounded-full">
               {activeDeliveries.length}
             </span>
          )}
        </button>
        <button
          onClick={() => setTab("READY")}
          className={`flex-1 py-2 text-sm font-bold rounded-[8px] transition-all flex items-center justify-center gap-2 ${
            tab === "READY"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          }`}
        >
          Ready for Delivery
          {readyBaskets.length > 0 && (
             <span className="bg-sky-500 text-white text-[10px] px-2 py-0.5 rounded-full">
               {readyBaskets.length}
             </span>
          )}
        </button>
        <button
          onClick={() => setTab("PAST")}
          className={`flex-1 py-2 text-sm font-bold rounded-[8px] transition-all ${
            tab === "PAST"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          }`}
        >
          Past Orders
        </button>
      </div>

      {/* List */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {tab === "READY" ? (
          readyBaskets.length === 0 ? (
            <div className="col-span-full py-16 flex flex-col items-center justify-center text-center border-2 border-dashed border-border rounded-2xl bg-muted/10">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <PackageOpen className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-1">
                No baskets ready for delivery yet
              </h3>
              <p className="text-muted-foreground text-sm max-w-sm">
                Reach 100% on a goal to bring your food home!
              </p>
            </div>
          ) : (
            readyBaskets.map((basket) => (
              <Card key={basket.id} className="p-4 flex gap-4 items-center">
                <Image
                  src={basket.image}
                  alt={basket.name}
                  width={64}
                  height={64}
                  className="w-16 h-16 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <h3 className="font-semibold">{basket.name}</h3>
                  <Button 
                    size="sm" 
                    className="mt-2"
                    onClick={() => router.push(`/basket-goals/delivery/${basket.id}`)}
                  >
                    Bring it home
                  </Button>
                </div>
              </Card>
            ))
          )
        ) : displayList.length === 0 ? (
          <div className="col-span-full py-16 flex flex-col items-center justify-center text-center border-2 border-dashed border-border rounded-2xl bg-muted/10">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <PackageOpen className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-1">
              No {tab === "ACTIVE" ? "Active" : "Past"} Deliveries
            </h3>
            <p className="text-muted-foreground text-sm max-w-sm">
              {tab === "ACTIVE" 
                ? "Reach 100% on a goal to bring your food home!"
                : "You don't have any completed deliveries yet."}
            </p>
          </div>
        ) : (
          displayList.map((delivery) => (
            <DeliveryCard key={delivery.id} delivery={delivery} type={tab as any} />
          ))
        )}
      </div>
    </div>
  );
}

export function DeliveriesWrapper({ deliveries, readyBaskets }: DeliveriesWrapperProps) {
  return (
    <Suspense fallback={<div className="h-[400px] flex items-center justify-center">Loading...</div>}>
      <DeliveriesContent deliveries={deliveries} readyBaskets={readyBaskets} />
    </Suspense>
  );
}

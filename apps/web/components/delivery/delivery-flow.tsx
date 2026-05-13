"use client";

import { useState } from "react";
import { OrderSummary } from "./order-summary";
import { LiveTracking } from "./live-tracking";
import { DeliveryComplete } from "./delivery-complete";
import { ArrowLeft } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface DeliveryFlowProps {
  basket: any;
  commodity: any;
  existingDelivery?: any;
  walletBalance: number;
}

export function DeliveryFlow({ basket, commodity, existingDelivery, walletBalance }: DeliveryFlowProps) {
  const getDefaultScreen = () => {
    if (!existingDelivery) return "SUMMARY";
    if (existingDelivery.status === "DELIVERED") return "DELIVERED";
    return "TRACKING";
  };

  const [activeScreen, setActiveScreen] = useState<"SUMMARY" | "TRACKING" | "DELIVERED">(getDefaultScreen());
  const [delivery, setDelivery] = useState<any>(existingDelivery || null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleCreateDelivery = async(deliveryData: any) => {
    try {
      setIsSubmitting(true);
      const response = await axios.post("/api/delivery/request", {
        basketId: basket.id,
        ...deliveryData,
      });

      setDelivery(response.data.delivery);
      toast.success("Delivery requested successfully!");
      setActiveScreen("TRACKING");
    } catch (error: any) {
      console.error("Delivery request failed", error);
      console.log(error.response?.data?.error)
      toast.error(error.response?.data?.error || "Failed to request delivery");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFinish = () => {
    router.push("/deliveries?tab=PAST");
    router.refresh();
  };

  return (
    <div className="w-full h-full flex flex-col overflow-y-auto bg-background">
      {activeScreen !== "TRACKING" && (
        <>
          {/* App Header */}
          <div className="bg-primary pt-8 pb-6 px-8 flex items-center gap-4">
            {activeScreen === "SUMMARY" && (
               <button
                 onClick={() => router.back()}
                 className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center text-primary-foreground hover:bg-primary-foreground/30 transition-colors"
               >
                 <ArrowLeft className="w-5 h-5" />
               </button>
            )}
            <div className="flex-1">
              <h1 className="text-primary-foreground text-xl font-bold">
                 {activeScreen === "SUMMARY" ? "Delivery Details" : "Completed"}
              </h1>
              <p className="text-primary-foreground/80 text-sm mt-1">
                {activeScreen === "SUMMARY" ? "Confirm your order" : "Order delivered"}
              </p>
            </div>
            {activeScreen === "SUMMARY" && (
               <div className="bg-accent text-accent-foreground text-xs font-bold px-4 py-1.5 rounded-full shadow-sm">
                 Ready
               </div>
            )}
          </div>

          <div className="flex-1 p-6 md:p-8 bg-muted/50">
            {/* Mock App Tabs (purely visual decorative) */}
            <div className="flex bg-background rounded-xl p-1 gap-1 mb-5 shadow-sm border border-border">
              <div className={`flex-1 text-center py-2 text-xs font-bold rounded-[9px] transition-all ${activeScreen === "SUMMARY" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground"}`}>
                Summary
              </div>
              <div className={`flex-1 text-center py-2 text-xs font-bold rounded-[9px] transition-all text-muted-foreground`}>
                Tracking
              </div>
              <div className={`flex-1 text-center py-2 text-xs font-bold rounded-[9px] transition-all ${activeScreen === "DELIVERED" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground"}`}>
                Delivered
              </div>
            </div>

            {activeScreen === "SUMMARY" && (
              <OrderSummary
                basket={basket}
                commodity={commodity}
                onSubmitRequestId={handleCreateDelivery}
                isSubmitting={isSubmitting}
                walletBalance={walletBalance}
              />
            )}

            {activeScreen === "DELIVERED" && (
              <DeliveryComplete
                 delivery={delivery}
                 onFinish={handleFinish}
              />
            )}
          </div>
        </>
      )}

      {activeScreen === "TRACKING" && (
        <LiveTracking
           delivery={delivery}
           onDeliveryComplete={() => setActiveScreen("DELIVERED")}
        />
      )}
    </div>
  );
}

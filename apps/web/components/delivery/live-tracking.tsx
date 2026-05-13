"use client";

import { useEffect, useState, useRef } from "react";
import { ArrowLeft, Phone, MessageSquare, RefreshCw, Star, MapPin } from "lucide-react";
import { supabase } from "@/lib/supabase-client";
import Link from "next/link";

interface LiveTrackingProps {
  delivery: any;
  onDeliveryComplete: () => void;
}

type StepKey = "PENDING" | "CONFIRMED" | "PREPARING" | "IN_TRANSIT" | "AT_CUSTOMER" | "DELIVERED";

interface TrackingStep {
  key: StepKey;
  label: string;
  description: string;
}

const STEPS: TrackingStep[] = [
  {
    key: "PENDING",
    label: "Order Received",
    description: "Your order has been received and is awaiting dispatch.",
  },
  {
    key: "CONFIRMED",
    label: "Rider at Hub",
    description: "Your rider has arrived at the central hub for pickup.",
  },
  {
    key: "PREPARING",
    label: "Items Picked Up",
    description: "Your foodstuff has been securely picked up by the rider.",
  },
  {
    key: "IN_TRANSIT",
    label: "Order In Transit",
    description: "Your items are on the way to your doorstep.",
  },
  {
    key: "AT_CUSTOMER",
    label: "Rider Has Arrived",
    description: "The rider is at your location! Please provide your security PIN.",
  },
  {
    key: "DELIVERED",
    label: "Order Delivered",
    description: "Your order has been delivered. Thank you for choosing Chowvest!",
  },
];

function formatTime(date: Date) {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function LiveTracking({ delivery, onDeliveryComplete }: LiveTrackingProps) {
  const [liveDelivery, setLiveDelivery] = useState<any>(delivery);
  const [completedSteps, setCompletedSteps] = useState<Set<StepKey>>(new Set(["PENDING"]));
  const [stepTimes, setStepTimes] = useState<Partial<Record<StepKey, Date>>>({});
  const completeTriggeredRef = useRef(false);

  const totalMinutes = liveDelivery?.deliveryOption === "EXPRESS" ? 18 : 25;

  function applyDeliveryUpdate(data: any) {
    setLiveDelivery(data);

    const newCompleted = new Set<StepKey>();
    const newTimes: Partial<Record<StepKey, Date>> = {};

    if (data.requestedAt) { newCompleted.add("PENDING"); newTimes.PENDING = new Date(data.requestedAt); }
    if (data.confirmedAt) { newCompleted.add("CONFIRMED"); newTimes.CONFIRMED = new Date(data.confirmedAt); }
    if (data.preparingAt) { newCompleted.add("PREPARING"); newTimes.PREPARING = new Date(data.preparingAt); }
    if (data.dispatchedAt) { newCompleted.add("IN_TRANSIT"); newTimes.IN_TRANSIT = new Date(data.dispatchedAt); }
    if (data.arrivedAt) { newCompleted.add("AT_CUSTOMER"); newTimes.AT_CUSTOMER = new Date(data.arrivedAt); }
    if (data.deliveredAt) { newCompleted.add("DELIVERED"); newTimes.DELIVERED = new Date(data.deliveredAt); }

    setCompletedSteps(newCompleted);
    setStepTimes(newTimes);

    if (data.status === "DELIVERED" && !completeTriggeredRef.current) {
      completeTriggeredRef.current = true;
      setTimeout(() => onDeliveryComplete(), 1500);
    }
  }

  useEffect(() => {
    if (!delivery?.id) return;

    applyDeliveryUpdate(delivery);

    const channel = supabase
      .channel(`delivery-${delivery.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "Delivery",
          filter: `id=eq.${delivery.id}`,
        },
        (payload) => applyDeliveryUpdate(payload.new)
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [delivery?.id]);

  const orderId = liveDelivery?.id
    ? liveDelivery.id.substring(liveDelivery.id.length - 6).toUpperCase()
    : "949347";

  return (
    <div className="min-h-full bg-[#F9FAFB] flex flex-col font-sans">
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-6 pb-4 bg-white border-b border-border sticky top-0 z-10">
        <Link href="/dashboard" className="flex items-center gap-3">
          <button className="w-10 h-10 rounded-full bg-muted/30 flex items-center justify-center hover:bg-muted/50 transition-colors">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-xl font-bold tracking-tight text-foreground">Order #{orderId}</h1>
        </Link>
        <div className="bg-primary/10 text-primary text-[11px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full">
           LIVE
        </div>
      </div>

      {/* Delivery time hero */}
      <div className="px-6 pt-8 pb-6 text-center bg-white">
        <p className="text-xs text-muted-foreground font-black uppercase tracking-[0.2em] mb-2">Estimated Arrival</p>
        <p className="text-6xl font-black text-foreground tracking-tighter">{totalMinutes}<span className="text-xl font-bold ml-1 text-muted-foreground uppercase">min</span></p>
      </div>

      {/* Hero Animation / Status */}
      <div className="bg-white px-6 pb-10 flex justify-center">
         <div className="w-full max-w-xs bg-primary/5 rounded-[32px] p-8 border border-primary/10 flex flex-col items-center gap-4 text-center">
            <div className="w-16 h-16 bg-white rounded-2xl shadow-xl shadow-primary/10 flex items-center justify-center">
               <MapPin className="w-8 h-8 text-primary animate-bounce" />
            </div>
            <div className="space-y-1">
               <h2 className="text-2xl font-black tracking-tight uppercase leading-none">On the way 🛵</h2>
               <p className="text-sm text-muted-foreground font-medium">Your request for items is confirmed. Track your delivery rider's progress.</p>
            </div>
         </div>
      </div>

      {/* Timeline card */}
      <div className="px-6 -mt-5">
        <div className="bg-white rounded-[32px] shadow-2xl shadow-black/5 border border-border p-8 space-y-0">
          {STEPS.map((step, index) => {
            const isCompleted = completedSteps.has(step.key);
            const isLast = index === STEPS.length - 1;
            const time = stepTimes[step.key];

            return (
              <div key={step.key} className="flex gap-4">
                {/* Left: icon + line */}
                <div className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-all duration-500 ${
                      isCompleted
                        ? "bg-primary shadow-lg shadow-primary/20"
                        : "bg-muted border border-border"
                    }`}
                  >
                    {isCompleted ? (
                      <svg className="w-4 h-4 text-primary-foreground" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-muted-foreground opacity-30" />
                    )}
                  </div>
                  {!isLast && (
                    <div
                      className={`w-0.5 my-1 transition-all duration-700 ${
                        completedSteps.has(STEPS[index + 1]?.key)
                          ? "bg-primary h-12"
                          : "bg-border h-12"
                      }`}
                    />
                  )}
                </div>

                {/* Right: text */}
                <div className={`pb-${isLast ? "0" : "4"} flex-1 pt-1`}>
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`text-[15px] font-black uppercase tracking-tight transition-colors ${
                        isCompleted ? "text-foreground" : "text-muted-foreground/50"
                      }`}
                    >
                      {step.label}
                    </span>
                    {time && (
                      <span className="text-[12px] font-bold text-muted-foreground tabular-nums">
                        {formatTime(time)}
                      </span>
                    )}
                  </div>
                  <p className={`text-[13px] font-medium leading-snug transition-colors ${
                    isCompleted ? "text-muted-foreground" : "text-muted-foreground/30"
                  }`}>
                    {step.description}
                  </p>
                  {step.key === "AT_CUSTOMER" && completedSteps.has("AT_CUSTOMER") && liveDelivery?.deliveryPin && (
                    <div className="mt-3 bg-primary/5 border border-primary/20 rounded-2xl p-4 text-center">
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">Your Security PIN</p>
                      <p className="text-4xl font-black tracking-[0.3em] text-primary">{liveDelivery.deliveryPin}</p>
                      <p className="text-[11px] text-muted-foreground mt-2 font-medium">Share this with your rider to confirm delivery</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Rider info */}
      <div className="px-6 mt-6 pb-12">
        <div className="bg-black text-white rounded-[32px] p-6 flex items-center gap-4 shadow-xl shadow-black/10">
          <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-white font-black text-2xl shrink-0">
            {liveDelivery?.rider?.fullName ? liveDelivery.rider.fullName.charAt(0) : "R"}
          </div>
          <div className="flex-1">
            <p className="text-lg font-black tracking-tight leading-none mb-1">{liveDelivery?.rider?.fullName || "Awaiting Rider..."}</p>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-white/10 px-2 py-0.5 rounded-full">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                <span className="text-[11px] font-black text-white/80">
                  {liveDelivery?.rider?.rating || "4.9"}
                </span>
              </div>
              <span className="text-[11px] font-bold text-white/50 uppercase tracking-widest">
                {liveDelivery?.deliveryOption === "EXPRESS" ? "Express" : "Standard"} Courier
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
              <MessageSquare className="w-5 h-5 text-white" />
            </button>
            <a 
              href={liveDelivery?.rider?.phoneNumber ? `tel:${liveDelivery.rider.phoneNumber}` : "#"} 
              className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20"
            >
              <Phone className="w-5 h-5 text-primary-foreground" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

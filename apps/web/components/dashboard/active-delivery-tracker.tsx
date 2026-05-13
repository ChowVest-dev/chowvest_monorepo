"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Truck, ChevronRight, ChevronLeft, Package, MapPin } from "lucide-react";
import { Card } from "@chowvest/ui";
import { Button } from "@chowvest/ui";
import Link from "next/link";
import Image from "next/image";

interface ActiveDeliveryTrackerProps {
  deliveries: any[];
}

export function ActiveDeliveryTracker({ deliveries }: ActiveDeliveryTrackerProps) {
  const [index, setIndex] = useState(0);

  const next = () => setIndex((i) => (i + 1) % deliveries.length);
  const prev = () => setIndex((i) => (i - 1 + deliveries.length) % deliveries.length);

  const delivery = deliveries[index];

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "PENDING": return "Request Placed";
      case "CONFIRMED": return "Order Confirmed";
      case "PREPARING": return "Packaging your food";
      case "IN_TRANSIT": return "Rider is on the way";
      default: return status;
    }
  };

  if (!delivery) return null;

  return (
    <Card className="relative overflow-hidden bg-gradient-to-r from-primary/10 via-primary/5 to-background border-primary/20 shadow-lg group">
      <AnimatePresence mode="wait">
        <motion.div
          key={delivery.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="p-4 md:p-6"
        >
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6">
            {/* Image & Pulse */}
            <div className="relative">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl overflow-hidden border-2 border-white shadow-md relative z-10">
                <Image
                  src={delivery.image || "/rice.jpg"}
                  alt={delivery.commodityName}
                  fill
                  sizes="(max-width: 768px) 64px, 80px"
                  className="object-cover"
                />
              </div>
              <div className="absolute -inset-1 bg-primary/30 rounded-2xl animate-ping opacity-20 z-0" />
            </div>

            {/* Content */}
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wider animate-pulse">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                  </span>
                  Active Delivery
                </div>
                <span className="text-xs text-muted-foreground font-medium">#{delivery.id.slice(-6).toUpperCase()}</span>
              </div>
              
              <h3 className="text-lg md:text-xl font-extrabold text-foreground leading-tight">
                {delivery.commodityName}
              </h3>
              
              <div className="flex items-center gap-2 text-primary font-semibold text-sm">
                <Truck className="w-4 h-4" />
                <span>{getStatusLabel(delivery.status)}</span>
              </div>
            </div>

            {/* Action */}
            <div className="w-full md:w-auto flex items-center gap-3">
              <Button asChild className="w-full md:w-auto h-12 px-6 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl shadow-md transition-all active:scale-95 font-bold gap-2">
                <Link href={`/basket-goals/delivery/${delivery.basketId}`}>
                  Track Live
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Carousel Controls */}
      {deliveries.length > 1 && (
        <div className="absolute right-4 top-4 flex gap-1 items-center">
            <button onClick={prev} className="p-1 rounded-full hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors">
                <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-[10px] font-bold text-muted-foreground tabular-nums">
                {index + 1} / {deliveries.length}
            </span>
            <button onClick={next} className="p-1 rounded-full hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors">
                <ChevronRight className="w-4 h-4" />
            </button>
        </div>
      )}

      {/* Bottom Progress Line (Decorative) */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary/5">
        <motion.div 
            className="h-full bg-primary/40"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
        />
      </div>
    </Card>
  );
}

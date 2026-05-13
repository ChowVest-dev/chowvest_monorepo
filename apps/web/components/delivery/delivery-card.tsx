"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MapPin, Package, Clock, CheckCircle2, User, Phone } from "lucide-react";
import { Button } from "@chowvest/ui";
import type { SerializedDelivery } from "./types";

interface DeliveryCardProps {
  delivery: SerializedDelivery;
  type: "ACTIVE" | "PAST";
}

export function DeliveryCard({ delivery, type }: DeliveryCardProps) {
  const getStatusDisplay = (status: string) => {
    switch (status) {
      case "PENDING":
        return { label: "Request Placed", color: "text-orange-500", bg: "bg-orange-500/10", icon: Clock };
      case "CONFIRMED":
        return { label: "Confirmed", color: "text-blue-500", bg: "bg-blue-500/10", icon: CheckCircle2 };
      case "PREPARING":
        return { label: "Packaging", color: "text-purple-500", bg: "bg-purple-500/10", icon: Package };
      case "IN_TRANSIT":
        return { label: "On the way", color: "text-primary", bg: "bg-primary/10", icon: Package };
      case "DELIVERED":
        return { label: "Delivered", color: "text-primary", bg: "bg-primary/10", icon: CheckCircle2 };
      case "CANCELLED":
        return { label: "Cancelled", color: "text-destructive", bg: "bg-destructive/10", icon: Clock };
      default:
        return { label: status, color: "text-muted-foreground", bg: "bg-muted", icon: Clock };
    }
  };

  const statusInfo = getStatusDisplay(delivery.status);
  const StatusIcon = statusInfo.icon;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    });
  };

  return (
    <div className="bg-background border border-border rounded-2xl overflow-hidden shadow-sm flex flex-col hover:shadow-md transition-shadow">
      <div className="p-5 flex gap-4">
         <div className="w-16 h-16 rounded-xl bg-muted/50 flex-shrink-0 relative overflow-hidden border border-border">
           <Image
             src={delivery.image}
             alt={delivery.commodityName}
             fill
             sizes="64px"
             className="object-cover"
           />
         </div>
         <div className="flex-1">
           <div className="flex justify-between items-start">
             <h3 className="font-bold text-foreground text-sm line-clamp-1">{delivery.commodityName}</h3>
             <div className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 ${statusInfo.bg} ${statusInfo.color}`}>
               <StatusIcon className="w-3 h-3" />
               {statusInfo.label}
             </div>
           </div>
           
           <div className="text-xl font-extrabold text-foreground mt-1">
             ₦{delivery.amount.toLocaleString()}
           </div>
           
           <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1 line-clamp-1">
             <MapPin className="w-3 h-3" />
             {delivery.address}
           </p>

           {type === "ACTIVE" && (delivery.riderName || delivery.deliveryPin) && (
             <div className="mt-4 pt-4 border-t border-dashed border-border space-y-3">
               {delivery.riderName && (
                 <div className="flex items-center justify-between">
                   <div className="flex items-center gap-2">
                     <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                       <User className="w-3.5 h-3.5" />
                     </div>
                     <div className="text-[10px]">
                       <p className="font-bold leading-tight">{delivery.riderName}</p>
                       <p className="text-muted-foreground">Your Rider</p>
                     </div>
                   </div>
                   {delivery.riderPhone && (
                     <Button size="icon" variant="outline" className="h-7 w-7 rounded-full border-primary/20 text-primary" asChild>
                       <a href={`tel:${delivery.riderPhone}`}>
                         <Phone className="w-3.5 h-3.5" />
                       </a>
                     </Button>
                   )}
                 </div>
               )}

               {delivery.deliveryPin && (
                 <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-2.5 flex items-center justify-between">
                   <div>
                     <p className="text-[9px] font-bold text-amber-600 uppercase tracking-wider">Delivery PIN</p>
                     <p className="text-xs font-black text-amber-700">Give this to the rider</p>
                   </div>
                   <div className="text-lg font-black tracking-widest text-amber-600 font-mono">
                     {delivery.deliveryPin}
                   </div>
                 </div>
               )}
             </div>
           )}
         </div>
      </div>

      <div className="bg-muted/30 px-5 py-3 border-t border-border mt-auto flex items-center justify-between">
        <div className="text-xs text-muted-foreground font-medium">
          {type === "ACTIVE" ? (
             <span>Placed on {formatDate(delivery.createdAt)}</span>
          ) : (
             <span>
               {delivery.status === "DELIVERED" 
                 ? `Arrived on ${delivery.deliveredAt ? formatDate(delivery.deliveredAt) : 'Unknown'}` 
                 : `Updated on ${formatDate(delivery.createdAt)}`}
             </span>
          )}
        </div>

        {type === "ACTIVE" && delivery.basketId && (
          <Button asChild variant="ghost" className="h-8 px-3 text-primary font-bold hover:bg-primary/10 text-xs">
            <Link href={`/basket-goals/delivery/${delivery.basketId}`}>
              Track Order <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}

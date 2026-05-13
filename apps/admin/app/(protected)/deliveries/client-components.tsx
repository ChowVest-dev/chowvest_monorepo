"use client";

import { useTransition } from "react";
import { updateDeliveryStatus, assignFleet } from "./actions";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@chowvest/ui";
import { toast } from "sonner";
import { Loader2, Truck } from "lucide-react";

export function DeliveryStatusChanger({ deliveryId, currentStatus }: { deliveryId: string, currentStatus: string }) {
  const [isPending, startTransition] = useTransition();

  const handleStatusChange = (newStatus: string) => {
    if (newStatus === currentStatus) return;
    
    startTransition(async () => {
      try {
        await updateDeliveryStatus(deliveryId, newStatus);
        toast.success(`Delivery moved to ${newStatus}`);
      } catch (e: any) {
        toast.error(e.message || "Failed to update delivery");
      }
    });
  };

  return (
    <div className="flex items-center gap-2">
      <Select 
        defaultValue={currentStatus} 
        onValueChange={handleStatusChange}
        disabled={isPending}
      >
        <SelectTrigger className="w-full h-8 text-[10px] font-bold uppercase tracking-wider">
          {isPending ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : null}
          <SelectValue placeholder="Update Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="PENDING">Awaiting Dispatch</SelectItem>
          <SelectItem value="CONFIRMED">Rider at Pickup</SelectItem>
          <SelectItem value="PREPARING">Items Picked Up</SelectItem>
          <SelectItem value="IN_TRANSIT">In Transit</SelectItem>
          <SelectItem value="AT_CUSTOMER">Rider Arrived</SelectItem>
          <SelectItem value="DELIVERED">Delivered</SelectItem>
          <SelectItem value="CANCELLED">Cancelled</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

export function AssignLogisticsDropdown({ deliveryId, companies, currentCompanyId }: { deliveryId: string, companies: any[], currentCompanyId?: string | null }) {
  const [isPending, startTransition] = useTransition();

  const handleAssign = (companyId: string) => {
    startTransition(async () => {
      try {
        await assignFleet(deliveryId, companyId);
        toast.success("Fleet assigned successfully");
      } catch (e: any) {
        toast.error(e.message || "Failed to assign fleet");
      }
    });
  };

  return (
    <div className="flex items-center gap-2">
      <Select 
        defaultValue={currentCompanyId || undefined} 
        onValueChange={handleAssign}
        disabled={isPending}
      >
        <SelectTrigger className="w-full h-8 text-[10px] font-black uppercase tracking-widest bg-primary/5 text-primary border-primary/20">
          {isPending ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : <Truck className="w-3 h-3 mr-2" />}
          <SelectValue placeholder="Assign Partner" />
        </SelectTrigger>
        <SelectContent>
          {companies.map((company) => (
            <SelectItem key={company.id} value={company.id}>
              {company.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

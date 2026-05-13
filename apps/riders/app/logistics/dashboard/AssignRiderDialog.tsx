"use client";

import { useState, useTransition } from "react";
import { Button, Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@chowvest/ui";
import { Bike, Loader2, Check } from "lucide-react";
import { assignRiderToDelivery } from "../actions";
import { toast } from "sonner";

interface AssignRiderDialogProps {
  deliveryId: string;
  riders: any[];
}

export function AssignRiderDialog({ deliveryId, riders }: AssignRiderDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleAssign(riderId: string) {
    startTransition(async () => {
      const result = await assignRiderToDelivery(deliveryId, riderId);
      if (result.success) {
        toast.success("Rider assigned successfully!");
        setOpen(false);
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">Assign Rider</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Assign Fleet Rider</DialogTitle>
          <DialogDescription>
            Select a rider from your fleet to handle this delivery.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-2">
          {riders.length > 0 ? riders.map((rider) => {
            const isBusy = rider.deliveries && rider.deliveries.length > 0;
            return (
              <button
                key={rider.id}
                disabled={isPending || isBusy}
                onClick={() => handleAssign(rider.id)}
                className="w-full flex items-center justify-between p-4 border rounded-xl hover:bg-muted/50 transition-colors group disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                    isBusy ? "bg-red-100 text-red-600" : "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white"
                  }`}>
                    <Bike className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{rider.fullName}</p>
                      {isBusy && <span className="text-[10px] font-black uppercase tracking-widest text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-100">Busy</span>}
                    </div>
                    <p className="text-xs text-muted-foreground">{rider.phoneNumber}</p>
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full border flex items-center justify-center group-hover:border-primary group-hover:text-primary">
                  {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : isBusy ? <span className="w-2 h-2 rounded-full bg-red-500"></span> : <Check className="w-4 h-4 opacity-0 group-hover:opacity-100" />}
                </div>
              </button>
            );
          }) : (
            <div className="text-center py-8 text-muted-foreground">
              No riders available. Add riders to your fleet first.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

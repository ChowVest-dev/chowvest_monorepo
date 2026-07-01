"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@chowvest/ui";
import { Button } from "@chowvest/ui";
import { TrendingUp, CheckCircle2 } from "lucide-react";

interface FirstTransferExplainerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FirstTransferExplainer({
  open,
  onOpenChange,
}: FirstTransferExplainerProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md text-center border-border bg-card">
        <DialogHeader className="flex flex-col items-center text-center pb-2">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 text-primary">
            <TrendingUp className="w-8 h-8" />
          </div>
          <DialogTitle className="text-2xl font-bold">Awesome start!</DialogTitle>
          <DialogDescription className="text-base mt-2">
            You've just made your first transfer towards your savings goal. Here is what happens next!
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4 text-left">
          <div className="flex items-start gap-4">
            <div className="bg-accent text-foreground w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-bold">
              1
            </div>
            <div>
              <h4 className="font-semibold text-foreground">Keep Saving</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Continue transferring funds until your basket reaches 100%. Don't worry, your locked price is protected against inflation!
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-4">
            <div className="bg-accent text-foreground w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-bold">
              2
            </div>
            <div>
              <h4 className="font-semibold text-foreground">Request Delivery</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Once you hit 100%, head over to the dashboard to request your delivery.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="bg-primary/20 text-primary w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-bold">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground">We Bring It Home</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Our logistics team will package your items and deliver them right to your doorstep.
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="sm:justify-center mt-2">
          <Button
            type="button"
            className="w-full sm:w-auto px-8"
            onClick={() => onOpenChange(false)}
          >
            Got it, thanks!
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

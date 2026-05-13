"use client";

import { useState, useActionState, useEffect } from "react";
import { Button, Input, Label, Card, CardContent, CardDescription, CardHeader, CardTitle, Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@chowvest/ui";
import { Plus, Bike, ShieldCheck, Eye, EyeOff } from "lucide-react";
import { addRider } from "../actions";
import { toast } from "sonner";

export function AddRiderDialog() {
  const [open, setOpen] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [state, formAction, pending] = useActionState(addRider, null);

  useEffect(() => {
    if (state?.success) {
      toast.success("Rider added successfully!");
      setOpen(false);
    } else if (state?.error) {
      toast.error(state.error);
    }
  }, [state]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Add Rider
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 text-primary">
            <Bike className="w-6 h-6" />
          </div>
          <DialogTitle>Register New Rider</DialogTitle>
          <DialogDescription>
            Add a new rider to your fleet. They'll use their phone and PIN to log in.
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input id="fullName" name="fullName" placeholder="e.g. John Doe" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Phone Number</Label>
            <Input id="phoneNumber" name="phoneNumber" type="tel" placeholder="e.g. 08012345678" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="loginPin">Login PIN (4 digits)</Label>
            <div className="relative">
              <Input 
                id="loginPin" 
                name="loginPin" 
                type={showPin ? "text" : "password"} 
                placeholder="••••" 
                maxLength={4} 
                pattern="[0-9]{4}"
                className="tracking-widest pr-10"
                required 
              />
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                tabIndex={-1}
              >
                {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[10px] text-muted-foreground flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> Secure 4-digit PIN for rider app access
            </p>
          </div>
          <Button type="submit" className="w-full mt-4" disabled={pending}>
            {pending ? "Adding..." : "Add Rider to Fleet"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

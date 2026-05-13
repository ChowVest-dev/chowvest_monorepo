"use client";

import { useTransition, useState } from "react";
import { Button } from "@chowvest/ui";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@chowvest/ui";
import { Input } from "@chowvest/ui";
import { Label } from "@chowvest/ui";
import { toggleUserSuspension, forceLogoutUser, creditUserWallet } from "./actions";
import { ShieldBan, LogOut, CheckCircle2, Wallet, Plus, Loader2 } from "lucide-react";
import { toast } from "sonner"; // Assuming sonner is installed, if not we'll handle gracefully

export function SuspendUserButton({ userId, isSuspended }: { userId: string, isSuspended: boolean }) {
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    startTransition(async () => {
      try {
        const res = await toggleUserSuspension(userId);
        if (res.success) {
          toast(`User ${res.status === "suspended" ? "Suspended" : "Re-activated"}`);
        }
      } catch (e: any) {
        toast.error(e.message || "Failed to update status");
      }
    });
  };

  return (
    <Button 
      variant={isSuspended ? "outline" : "destructive"} 
      onClick={handleToggle}
      disabled={isPending}
    >
      {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 
        (isSuspended ? <CheckCircle2 className="mr-2 h-4 w-4" /> : <ShieldBan className="mr-2 h-4 w-4" />)}
      {isSuspended ? "Unsuspend User" : "Suspend User"}
    </Button>
  );
}

export function ForceLogoutButton({ userId }: { userId: string }) {
  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
    startTransition(async () => {
      try {
        await forceLogoutUser(userId);
        toast("Revoked all active sessions for user.");
      } catch (e: any) {
        toast.error(e.message || "Failed to force logout");
      }
    });
  };

  return (
    <Button variant="secondary" onClick={handleLogout} disabled={isPending}>
      {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogOut className="mr-2 h-4 w-4" />}
      Force Logout
    </Button>
  );
}

export function CreditWalletButton({ userId, disabled }: { userId: string, disabled?: boolean }) {
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [amountInput, setAmountInput] = useState("");

  const handleCredit = () => {
    const amount = Number(amountInput);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid positive number");
      return;
    }

    startTransition(async () => {
      try {
        await creditUserWallet(userId, amount);
        toast.success(`Successfully credited ₦${amount.toLocaleString()}`);
        setOpen(false);
        setAmountInput("");
      } catch (e: any) {
        toast.error(e.message || "Failed to credit wallet");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button disabled={disabled} className="bg-green-600 hover:bg-green-700 text-white">
          <Plus className="mr-2 h-4 w-4" />
          Credit User
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Credit User Wallet</DialogTitle>
          <DialogDescription>
            Enter the amount to credit to this user's wallet. This action will be logged.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="amount" className="text-right">
              Amount (₦)
            </Label>
            <Input
              id="amount"
              type="number"
              value={amountInput}
              onChange={(e) => setAmountInput(e.target.value)}
              className="col-span-3"
              disabled={isPending}
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" onClick={handleCredit} disabled={isPending || !amountInput} className="bg-green-600 hover:bg-green-700 text-white">
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Credit Wallet
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

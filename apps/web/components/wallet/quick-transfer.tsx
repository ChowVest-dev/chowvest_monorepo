"use client";

import { Card } from "@chowvest/ui";
import { Button } from "@chowvest/ui";
import { Input } from "@chowvest/ui";
import { Label } from "@chowvest/ui";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@chowvest/ui";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import axios from "axios";

interface Basket {
  id: string;
  name: string;
  goalAmount: number;
  currentAmount: number;
  status: string;
}

interface QuickTransferProps {
  baskets: Basket[];
  balance: number;
}

export function QuickTransfer({ baskets, balance }: QuickTransferProps) {
  const [selectedBasket, setSelectedBasket] = useState("");
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const activeBaskets = baskets.filter((b) => b.status === "ACTIVE");

  // Auto-select basket if there's only one
  useEffect(() => {
    if (activeBaskets.length === 1) {
      setSelectedBasket(activeBaskets[0].id);
    }
  }, [activeBaskets.length]);

  const quickAmounts = [5000, 10000, 20000];

  const handleTransfer = async () => {
    if (
      !selectedBasket ||
      selectedBasket === "none" ||
      !amount ||
      parseFloat(amount) <= 0
    ) {
      toast.error("Please select a basket and enter an amount");
      return;
    }

    if (parseFloat(amount) > balance) {
      toast.error("Insufficient balance");
      return;
    }

    try {
      setIsLoading(true);

      const res = await axios.post("/api/wallet/transfer", {
        basketId: selectedBasket,
        amount: parseFloat(amount),
      });

      if (res.data.success) {
        const basketName =
          activeBaskets.find((b) => b.id === selectedBasket)?.name || "goal";
        toast.success(
          `₦${parseFloat(amount).toLocaleString()} transferred to ${basketName} successfully!`
        );
        setAmount("");
        setSelectedBasket("");
        // Refresh the page to show updated data
        router.refresh();
      }
    } catch (error) {
      console.error(error);
      toast.error("Transfer failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-6" data-onboarding-id="quick-transfer">
      <h3 className="text-xl font-semibold text-foreground mb-6">
        Quick Transfer
      </h3>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="goal">Transfer to Basket</Label>
          <Select value={selectedBasket} onValueChange={setSelectedBasket}>
            <SelectTrigger id="goal">
              <SelectValue placeholder="Select a basket" />
            </SelectTrigger>
            <SelectContent>
              {activeBaskets.length === 0 ? (
                <SelectItem value="none" disabled>
                  No active goals available
                </SelectItem>
              ) : (
                activeBaskets.map((basket) => (
                  <SelectItem key={basket.id} value={basket.id}>
                    {basket.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="amount">Amount</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              ₦
            </span>
            <Input
              id="amount"
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="pl-8"
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {quickAmounts.map((amt) => (
            <Button
              key={amt}
              variant="outline"
              size="sm"
              className="text-xs bg-transparent"
              onClick={() => setAmount(amt.toString())}
              disabled={isLoading}
            >
              ₦{amt / 1000}k
            </Button>
          ))}
        </div>

        <Button
          className="w-full mt-4"
          onClick={handleTransfer}
          disabled={isLoading || activeBaskets.length === 0}
        >
          {isLoading ? "Processing..." : "Transfer Now"}
        </Button>

        <div className="pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground text-center">
            Available balance:{" "}
            <span className="font-semibold text-foreground">
              ₦{balance.toLocaleString()}
            </span>
          </p>
        </div>
      </div>
    </Card>
  );
}

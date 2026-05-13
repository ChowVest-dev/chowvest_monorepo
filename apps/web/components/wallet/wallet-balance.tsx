"use client";

import { Card } from "@chowvest/ui";
import { Eye, EyeOff, Wallet } from "lucide-react";
import { Button } from "@chowvest/ui";
import { useState } from "react";

interface WalletProps {
  wallet: {
    balance: number;
    totalDeposits: number;
    totalSpent: number;
  };
}

export function WalletBalance({ wallet }: WalletProps) {
  const [showBalance, setShowBalance] = useState(true);

  const toggleBalanceVisibility = () => setShowBalance(!showBalance);

  // Calculate monthly increase (you can enhance this with actual monthly data)
  const monthlyIncrease = wallet.totalDeposits * 0.1; // Placeholder calculation

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Card
      className="p-6 bg-linear-to-br from-primary to-secondary text-primary-foreground relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary-foreground/5 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary-foreground/5 rounded-full translate-y-1/2 -translate-x-1/2" />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-primary-foreground/20 flex items-center justify-center">
              <Wallet className="w-5 h-5" />
            </div>
            <span className="text-sm font-medium opacity-90">
              Available Balance
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-primary-foreground hover:bg-primary-foreground/20"
            onClick={toggleBalanceVisibility}
          >
            {showBalance ? (
              <Eye className="w-5 h-5" />
            ) : (
              <EyeOff className="w-5 h-5" />
            )}
          </Button>
        </div>

        <div className="space-y-2">
          <p className="text-5xl font-bold">
            {showBalance ? formatCurrency(wallet.balance) : "₦••,•••"}
          </p>
          <p className="text-sm opacity-80">
            +{showBalance ? formatCurrency(monthlyIncrease) : "₦•••,•••"} this
            month
          </p>
        </div>

        <div className="mt-8 pt-6 border-t border-primary-foreground/20 grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs opacity-70 mb-1">Total Deposits</p>
            <p className="text-xl font-semibold">
              {showBalance ? formatCurrency(wallet.totalDeposits) : "₦•••,•••"}
            </p>
          </div>
          <div>
            <p className="text-xs opacity-70 mb-1">Total Market Spend</p>
            <p className="text-xl font-semibold">
              {showBalance ? formatCurrency(wallet.totalSpent) : "₦•••,•••"}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}

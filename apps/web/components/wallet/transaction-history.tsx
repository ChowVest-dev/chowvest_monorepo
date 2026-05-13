"use client";

import { Card } from "@chowvest/ui";
import { Badge } from "@chowvest/ui";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  ShoppingBasket,
  ShoppingBag,
  Truck,
  RotateCcw,
} from "lucide-react";
//import { useWalletStore } from "@/store/wallet-store";
import { format, isToday, isYesterday } from "date-fns";

const iconMap = {
  DEPOSIT: ArrowDownToLine,
  WITHDRAWAL: ArrowUpFromLine,
  TRANSFER_TO_BASKET: ShoppingBasket,
  TRANSFER_FROM_BASKET: ShoppingBasket,
  MARKET_PURCHASE: ShoppingBag,
  REFUND: ArrowDownToLine,
  FEE: Truck,
  REVERSAL: RotateCcw,
};

const statusColors = {
  PENDING: "bg-yellow-100 text-yellow-800 border-yellow-200",
  COMPLETED: "bg-green-100 text-green-800 border-green-200",
  FAILED: "bg-red-100 text-red-800 border-red-200",
  CANCELLED: "bg-gray-100 text-gray-800 border-gray-200",
};

interface Transaction {
  id: string;
  type: string;
  amount: number;
  netAmount: number;
  metadata?: { baseAmount?: number } | null;
  description: string;
  status: string;
  createdAt: string;
}

interface TransactionHistoryProps {
  transactions: Transaction[];
}

export function TransactionHistory({ transactions }: TransactionHistoryProps) {
  //const { transactions } = useWalletStore();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);

    if (isToday(date)) {
      return `Today, ${format(date, "h:mm a")}`;
    } else if (isYesterday(date)) {
      return `Yesterday, ${format(date, "h:mm a")}`;
    } else {
      return format(date, "MMM d, h:mm a");
    }
  };

  const isPositiveTransaction = (type: string) => {
    return (
      type === "DEPOSIT" || type === "REFUND" || type === "TRANSFER_FROM_BASKET"
    );
  };

  return (
    <Card className="p-6" data-onboarding-id="transaction-history">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold text-foreground">
            Transaction History
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Your recent wallet activity
          </p>
        </div>
        <Badge variant="outline">Last 30 days</Badge>
      </div>

      <div className="space-y-3">
        {transactions.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
              <ArrowDownToLine className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground font-medium">
              No transactions yet
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Make your first deposit to get started
            </p>
          </div>
        ) : (
          transactions.map((transaction) => {
            const Icon =
              iconMap[transaction.type as keyof typeof iconMap] || ArrowDownToLine;
            const isPositive = isPositiveTransaction(transaction.type);

            return (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-4 rounded-lg bg-accent/30 hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      isPositive ? "bg-primary/10" : "bg-muted"
                    }`}
                  >
                    <Icon
                      className={`w-5 h-5 ${
                        isPositive ? "text-primary" : "text-muted-foreground"
                      }`}
                    />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">
                      {transaction.description}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(transaction.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p
                    className={`font-semibold ${
                      isPositive ? "text-primary" : "text-foreground"
                    }`}
                  >
                    {isPositive ? "+" : ""}₦
                    {Math.abs(
                      isPositive
                        ? (transaction.metadata?.baseAmount || transaction.netAmount || transaction.amount)
                        : transaction.amount
                    ).toLocaleString()}
                  </p>
                  <Badge
                    className={`text-xs mt-1 border ${
                      statusColors[
                        transaction.status as keyof typeof statusColors
                      ]
                    }`}
                  >
                    {transaction.status.toLowerCase()}
                  </Badge>
                </div>
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
}

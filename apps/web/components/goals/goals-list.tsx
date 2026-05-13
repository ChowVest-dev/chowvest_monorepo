"use client";

import { Card } from "@chowvest/ui";
import { Progress } from "@chowvest/ui";
import { Button } from "@chowvest/ui";
import { Plus, MoreVertical, AlertCircle, Wallet } from "lucide-react";
import { BouncingDots } from "@chowvest/ui";
import { Badge } from "@chowvest/ui";
import { format } from "date-fns";
import { useState } from "react";
import { toast } from "sonner";
import axios from "axios";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@chowvest/ui";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@chowvest/ui";
import { Input } from "@chowvest/ui";
import { Label } from "@chowvest/ui";
import Image from "next/image";
import { DepositModal } from "@/components/wallet/deposit-modal"; 
import { useRouter } from "next/navigation";

interface Basket {
  id: string;
  name: string;
  commodityType: string | null;
  image: string | null;
  goalAmount: number;
  currentAmount: number;
  description: string | null;
  targetDate: string | null;
  regularTopUp: number | null;
  category: string;
  status: string;
}

interface GoalsListProps {
  baskets: Basket[];
  balance?: number;
  onUpdate?: () => void;
}

export function GoalsList({ baskets, balance, onUpdate }: GoalsListProps) {
  const router = useRouter();
  const [selectedBasket, setSelectedBasket] = useState<string | null>(null);
  const [addFundsOpen, setAddFundsOpen] = useState(false);
  const [goalToDelete, setGoalToDelete] = useState<string | null>(null);
  const [goalToCancel, setGoalToCancel] = useState<Basket | null>(null);
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [insufficientBalance, setInsufficientBalance] = useState(false);
  const [tab, setTab] = useState<"NEW" | "COMPLETED" | "CANCELLED">("NEW");

  const visibleBaskets = baskets.filter(
    (b: any) => {
      const isNotDelivered = !b.deliveries || b.deliveries.filter((d: any) => d.status !== "CANCELLED").length === 0;
      const isReached = b.currentAmount >= b.goalAmount;

      if (tab === "NEW") {
        return b.status === "ACTIVE" && !isReached && isNotDelivered;
      }
      if (tab === "COMPLETED") {
        return (b.status === "COMPLETED" || (b.status === "ACTIVE" && isReached)) && isNotDelivered;
      }
      if (tab === "CANCELLED") {
        return b.status === "CANCELLED";
      }
      return false;
    }
  );

  const handleAddFunds = (basketId: string) => {
    setSelectedBasket(basketId);
    setInsufficientBalance(false);
    setAddFundsOpen(true);
  };

  const handleCancelGoal = async () => {
    if (!goalToCancel) return;

    try {
      setIsLoading(true);
      await axios.post(`/api/baskets/${goalToCancel.id}/cancel`);
      
      const refundAmt = goalToCancel.currentAmount - (goalToCancel.currentAmount * 0.05);

      toast.success(
        goalToCancel.currentAmount > 0
          ? `Goal cancelled and ₦${refundAmt.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} refunded to wallet`
          : "Goal cancelled successfully"
      );

      if (onUpdate) {
        onUpdate();
      }
      setGoalToCancel(null);
    } catch (error: any) {
      console.error(error);
      const msg = error.response?.data?.error || "Failed to cancel goal";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteGoal = async () => {
    if (!goalToDelete) return;

    try {
      setIsLoading(true);
      await axios.delete(`/api/baskets/${goalToDelete}`);
      toast.success("Goal deleted permanently");

      if (onUpdate) {
        onUpdate();
      }
      setGoalToDelete(null);
    } catch (error: any) {
      console.error(error);
      const msg = error.response?.data?.error || "Failed to delete goal";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestDelivery = (basketId: string) => {
    router.push(`/basket-goals/delivery/${basketId}`);
  };

  const confirmAddFunds = async () => {
    if (!selectedBasket || !amount || parseFloat(amount) < 500) {
      toast.error("Minimum deposit amount is ₦500");
      return;
    }

    const activeBasket = baskets.find(b => b.id === selectedBasket);
    if (activeBasket) {
      const remainingAmount = activeBasket.goalAmount - activeBasket.currentAmount;
      if (parseFloat(amount) > remainingAmount) {
        toast.error(`Maximum allowed for this goal is ₦${remainingAmount.toLocaleString()}`);
        return;
      }
    }

    const availableBalance = balance || 0;
    if (parseFloat(amount) > availableBalance) {
      setInsufficientBalance(true);
      return;
    }

    setInsufficientBalance(false);

    try {
      setIsLoading(true);

      await axios.post(`/api/baskets/${selectedBasket}/add-funds`, {
        amount: parseFloat(amount),
      });

      toast.success("Funds added successfully!");
      setAddFundsOpen(false);
      setAmount("");
      setSelectedBasket(null);

      // Trigger refresh
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to add funds");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6" data-onboarding-id="goals-list">
      {/* Tabs */}
      <div className="flex bg-muted/30 p-1 w-full max-w-md rounded-[10px] border border-border">
        <button
          onClick={() => setTab("NEW")}
          className={`flex-1 py-1.5 text-sm font-bold rounded-[8px] transition-all flex items-center justify-center gap-2 ${
            tab === "NEW"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          }`}
        >
          Active
        </button>
        <button
          onClick={() => setTab("COMPLETED")}
          className={`flex-1 py-1.5 text-sm font-bold rounded-[8px] transition-all flex items-center justify-center gap-2 ${
            tab === "COMPLETED"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          }`}
        >
          Completed
        </button>
        <button
          onClick={() => setTab("CANCELLED")}
          className={`flex-1 py-1.5 text-sm font-bold rounded-[8px] transition-all ${
            tab === "CANCELLED"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          }`}
        >
          Cancelled
        </button>
      </div>

      {visibleBaskets.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
            <Plus className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">
            {tab === "NEW" ? "Ready to start stocking up?" : tab === "COMPLETED" ? "No Completed Goals" : "No Cancelled Goals"}
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            {tab === "NEW" ? "Start a new saving plan to secure your food supply." : "Nothing to show here"}
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
        {visibleBaskets.map((goal, i) => {
          const isCancelled = goal.status === "CANCELLED";
          const progress = (goal.currentAmount / goal.goalAmount) * 100;
          const remaining = goal.goalAmount - goal.currentAmount;

          const displayName = goal.name;
          const displayImage = goal.image || "/placeholder.svg";
          const displayCategory = goal.category;

          return (
            <Card
              key={goal.id}
              data-onboarding-id={i === 0 ? "goal-progress-bar" : undefined}
              className={`p-6 hover:shadow-lg transition-shadow ${
                progress >= 100 && !isCancelled ? "border-green-500 border-2" : ""
              } ${isCancelled ? "opacity-75 grayscale-[0.5] border-dashed" : ""}`}
            >
              <div className="flex flex-col md:flex-row gap-6">
                <div className="relative">
                  <Image
                    src={displayImage}
                    alt={displayName}
                    width={100}
                    height={100}
                    className="w-full md:w-32 h-32 rounded-xl object-cover bg-muted"
                  />
                  {progress >= 100 && (
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-white"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path d="M5 13l4 4L19 7"></path>
                      </svg>
                    </div>
                  )}
                </div>

                <div className="flex-1 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-xl font-semibold text-foreground">
                          {displayName}
                        </h3>
                        <Badge variant="secondary" className="text-xs">
                          {displayCategory}
                        </Badge>
                        {progress >= 100 && !isCancelled && (
                          <Badge className="text-xs bg-green-500 hover:bg-green-600">
                            Ready for Home!
                          </Badge>
                        )}
                        {isCancelled && (
                          <Badge variant="destructive" className="text-xs">
                            Cancelled
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {isCancelled
                          ? "Goal was cancelled"
                          : `Reach your basket by ${goal.targetDate
                              ? format(new Date(goal.targetDate), "MMM d, yyyy")
                              : "No deadline"}`}
                      </p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground"
                        >
                          <MoreVertical className="w-5 h-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {isCancelled ? (
                          <DropdownMenuItem
                            className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
                            onClick={() => setGoalToDelete(goal.id)}
                          >
                            Remove from history
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
                            onClick={() => setGoalToCancel(goal)}
                          >
                            End savings plan
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-semibold text-foreground">
                        {progress.toFixed(1)}%
                      </span>
                    </div>
                    <Progress value={progress} className="h-3" />
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-foreground font-medium">
                        ₦{goal.currentAmount.toLocaleString()} saved
                      </span>
                      <span className="text-muted-foreground">
                        ₦{remaining.toLocaleString()} remaining
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Regular Top-Up
                      </p>
                      <p className="text-sm font-semibold text-foreground">
                        ₦{goal.regularTopUp?.toLocaleString() || "0"}
                      </p>
                    </div>
                    {progress >= 100 && !isCancelled ? (
                      <Button
                        size="sm"
                        className="gap-2 bg-green-600 hover:bg-green-700"
                        onClick={() => handleRequestDelivery(goal.id)}
                      >
                        Deliver My Basket
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        className="gap-2"
                        onClick={() => handleAddFunds(goal.id)}
                        disabled={isCancelled}
                      >
                        <Plus className="w-4 h-4" />
                        Top Up Basket
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!goalToDelete}
        onOpenChange={(open) => !open && setGoalToDelete(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Goal Permanently</DialogTitle>
            <DialogDescription>
              Are you sure you want to permanently delete this goal? This will
              remove it from your history entirely.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 mt-4">
            <Button
              variant="outline"
              onClick={() => setGoalToDelete(null)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteGoal}
              disabled={isLoading}
            >
              {isLoading ? "Deleting..." : "Delete Permanently"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Cancel Confirmation Dialog */}
      <Dialog
        open={!!goalToCancel}
        onOpenChange={(open) => !open && setGoalToCancel(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>End this savings plan?</DialogTitle>
            <DialogDescription className="space-y-3">
              <p>
                Are you sure you want to cancel your <span className="font-bold">{goalToCancel?.name}</span>
                goal?
              </p>
              {goalToCancel && goalToCancel.currentAmount > 0 && (() => {
                const amount = goalToCancel.currentAmount;
                const penalty = amount * 0.05;
                const refund = amount - penalty;
                return (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm">
                    <p className="font-bold flex items-center gap-2 mb-1 text-red-600">
                      <span className="text-lg">⚠️</span> Processing Fee for cancellation 
                    </p>
                    <p className="mb-2">
                      A <span className="font-bold">5% (₦{penalty.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })})</span> will be deducted from your savings.
                    </p>
                    <p>
                      You will receive <span className="font-bold text-green-700">₦{refund.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span> back into your primary wallet immediately. Your progress will be reset for this goal.
                    </p>
                  </div>
                );
              })()}
              <p className="text-xs text-muted-foreground mt-2">
                This basket will be marked as cancelled. You can still view it later and permanently delete it later if you wish.
              </p>
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 mt-4">
            <Button
              variant="outline"
              onClick={() => setGoalToCancel(null)}
              disabled={isLoading}
            >
              Go Back
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelGoal}
              disabled={isLoading}
            >
              {isLoading ? "Ending..." : "End Plan"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Funds Dialog */}
      <Dialog open={addFundsOpen} onOpenChange={setAddFundsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Top Up Your Basket</DialogTitle>
            <DialogDescription>
              Add funds from your wallet to complete your basket.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Amount</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  ₦
                </span>
                <Input
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
              {[500, 1000, 5000].map((amt) => (
                <Button
                  key={amt}
                  variant="outline"
                  size="sm"
                  onClick={() => setAmount(amt.toString())}
                  disabled={isLoading}
                >
                  ₦{amt / 1000}k
                </Button>
              ))}
            </div>

            <div className="p-3 rounded-lg bg-muted">
              <p className="text-sm text-muted-foreground">
                Available balance:{" "}
                <span className="font-semibold text-foreground">
                  ₦{(balance || 0).toLocaleString()}
                </span>
              </p>
            </div>

            {insufficientBalance && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 space-y-3">
                <div className="flex items-center gap-2 text-red-700">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <p className="text-sm font-medium">
                    Not enough balance in your wallet
                  </p>
                </div>
                <p className="text-xs text-red-600">
                  You need ₦{((parseFloat(amount) - (balance || 0))).toLocaleString()} more to secure this basket. Fund your wallet first.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full gap-2 border-red-300 text-red-700 hover:bg-red-100 hover:text-red-800"
                  onClick={() => {
                    setAddFundsOpen(false);
                    setShowDepositModal(true);
                  }}
                >
                  <Wallet className="w-4 h-4" />
                  Deposit to Wallet
                </Button>
              </div>
            )}

            <Button
              onClick={confirmAddFunds}
              disabled={isLoading || !amount || parseFloat(amount) < 500}
              className="w-full"
            >
              {isLoading ? "Processing..." : "Top Up Now"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Deposit Modal */}
      <DepositModal open={showDepositModal} onOpenChange={setShowDepositModal} />
    </div>
  );
}

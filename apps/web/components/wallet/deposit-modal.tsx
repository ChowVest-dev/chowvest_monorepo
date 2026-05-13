"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@chowvest/ui";
import { Button } from "@chowvest/ui";
import { Input } from "@chowvest/ui";
import { Label } from "@chowvest/ui";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@chowvest/ui";
import { Card } from "@chowvest/ui";
import { Building2, ChevronDown, CreditCard } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

interface DepositModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DepositModal({ open, onOpenChange }: DepositModalProps) {
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"bank" | "card">("card");
  const [step, setStep] = useState<1 | 2>(1);
  const [showBreakdown, setShowBreakdown] = useState(false);

  const quickAmounts = [5000, 10000, 20000, 50000];

  // Fee calculation logic
  const baseAmount = amount ? parseFloat(amount) : 0;
  const serviceFee = 0;
  
  let processingFee = 0;
  let totalAmount = 0;
  
  if (baseAmount > 0) {
    const flatFee = baseAmount < 2500 ? 0 : 100;
    totalAmount = (baseAmount + flatFee) / 0.985;
    processingFee = totalAmount - baseAmount;
  }
  

  const handlePayment = async (method: "CARD" | "BANK_TRANSFER") => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    try {
      setIsLoading(true);
      const loadingToast = toast.loading("Initializing payment...");

      const res = await axios.post("/api/wallet/deposit", {
        amount: parseFloat(amount),
        method,
      });

      toast.dismiss(loadingToast);

      if (res.data.success && res.data.authorizationUrl) {
        toast.success("Redirecting to Paystack...");
        setTimeout(() => {
          window.location.href = res.data.authorizationUrl;
        }, 500);
      } else {
        toast.error("Failed to initialize payment");
      }
    } catch (error: any) {
      console.error("Payment error:", error);
      toast.error(
        error.response?.data?.error || "Failed to initialize payment"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onOpenChange(false);
      setAmount("");
      setActiveTab("card");
      setStep(1);
      setShowBreakdown(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{step === 1 ? "Fund Your Wallet" : "Payment Summary"}</DialogTitle>
          <DialogDescription>
            {step === 1 ? "Securely fund your wallet to start building your baskets." : "Review your transaction details before payment"}
          </DialogDescription>
        </DialogHeader>

        {step === 1 ? (
          <>
            <Tabs
              value={activeTab}
              onValueChange={(v) => setActiveTab(v as "bank" | "card")}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="card">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Card
                </TabsTrigger>
                <TabsTrigger value="bank">
                  <Building2 className="w-4 h-4 mr-2" />
                  Bank Transfer
                </TabsTrigger>
              </TabsList>
            </Tabs>

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
                    className="pl-8 text-lg"
                    min="0"
                    step="100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2">
                {quickAmounts.map((amt) => (
                  <Button
                    key={amt}
                    variant="outline"
                    size="sm"
                    onClick={() => setAmount(amt.toString())}
                  >
                    ₦{amt / 1000}k
                  </Button>
                ))}
              </div>

              {activeTab === "card" && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-xs text-green-800">
                    <strong>Secure Payment:</strong> Instant deposit processed
                    securely through Paystack.
                  </p>
                </div>
              )}

              {activeTab === "bank" && (
                <>
                  <Card className="p-4 bg-muted">
                    <p className="text-sm text-muted-foreground mb-2">
                      Get instant account details for bank transfer
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Paystack will generate a temporary account number for you to
                      transfer to. Your deposit will be confirmed automatically.
                    </p>
                  </Card>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-xs text-blue-800">
                      <strong>Note:</strong> You&apos;ll receive unique account
                      details to transfer to. Confirmation is usually instant.
                    </p>
                  </div>
                </>
              )}

              <Button
                onClick={() => setStep(2)}
                disabled={!amount || parseFloat(amount) <= 0}
                className="w-full"
              >
                Continue
              </Button>
            </div>
          </>
        ) : (
          <div className="space-y-4">
            <div className="text-center py-6 bg-muted/50 rounded-xl">
              <p className="text-sm text-muted-foreground mb-1">Total to Pay</p>
              <h1 className="text-4xl font-bold tracking-tight">₦{totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h1>
              <p className="text-xs text-muted-foreground mt-2">Includes all fees</p>
            </div>

            <Card className="overflow-hidden">
              <Button
                variant="ghost"
                className="w-full flex justify-between items-center p-4 hover:bg-muted/50 rounded-none h-auto"
                onClick={() => setShowBreakdown(!showBreakdown)}
              >
                <span className="font-medium text-sm">Transaction Breakdown</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${showBreakdown ? "rotate-180" : ""}`} />
              </Button>
              
              {showBreakdown && (
                <div className="p-4 pt-0 space-y-3 text-sm border-t bg-muted/20">
                  <div className="flex justify-between text-muted-foreground mt-3">
                    <span>Deposit Amount:</span>
                    <span className="font-medium text-foreground">₦{baseAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  {/*<div className="flex justify-between text-muted-foreground">
                    <span>Service Fee:</span>
                    <span className="font-medium text-foreground">₦{serviceFee.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div> 
                  */}
                  <div className="flex justify-between text-muted-foreground">
                    <span>Processing Fee:</span>
                    <span className="font-medium text-foreground">₦{processingFee.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="pt-3 flex justify-between border-t font-medium">
                    <span>Total</span>
                    <span>₦{totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                </div>
              )}
            </Card>

            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="w-1/3" onClick={() => setStep(1)} disabled={isLoading}>
                Back
              </Button>
              <Button
                onClick={() => handlePayment(activeTab === "card" ? "CARD" : "BANK_TRANSFER")}
                disabled={isLoading}
                className="w-2/3"
              >
                {isLoading ? "Processing..." : `Pay ₦${totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

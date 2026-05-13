"use client";

import { Navigation } from "@/components/navigation";
import { WalletHeader } from "@/components/wallet/wallet-header";
import { WalletBalance } from "@/components/wallet/wallet-balance";
import { TransactionHistory } from "@/components/wallet/transaction-history";
import { QuickTransfer } from "@/components/wallet/quick-transfer";
import { useIsMobile } from "@/hooks/use-mobile";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import axios from "axios";

interface Transaction {
  id: string;
  type: string;
  amount: number;
  netAmount: number;
  metadata?: { baseAmount?: number } | null;
  description: string;
  status: string;
  createdAt: string;
  basketId: string | null;
}

interface Wallet {
  balance: number;
  totalDeposits: number;
  totalSpent: number;
  transactions: Transaction[];
}

interface Basket {
  id: string;
  name: string;
  goalAmount: number;
  currentAmount: number;
  status: string;
}

interface WalletPageClientProps {
  wallet: Wallet;
  baskets: Basket[];
}

export function WalletPageClient({ wallet, baskets }: WalletPageClientProps) {
  const isMobile = useIsMobile();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    const paymentStatus = searchParams.get("payment");
    const reference =
      searchParams.get("reference") || searchParams.get("trxref");

    if (paymentStatus === "success" && reference) {
      handleVerifyPayment(reference);
    }
  }, [searchParams]);

  const handleVerifyPayment = async (reference: string) => {
    try {
      setIsVerifying(true);
      const loadingToast = toast.loading("Verifying your payment...");

      const response = await axios.post("/api/wallet/verify-payment", {
        reference,
      });

      if (response.data.success) {
        toast.success("Payment verified successfully!", {
          id: loadingToast,
        });
        // Remove search params from URL first, then refresh to get updated wallet data
        await router.push("/wallet", { scroll: false });
        router.refresh();
      } else {
        toast.error(response.data.error || "Verification failed", {
          id: loadingToast,
        });
      }
    } catch (error: any) {
      console.error("Verification error:", error);
      toast.error(error.response?.data?.error || "Failed to verify payment");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <>
      <Navigation />
      {isVerifying && (
        <div className="fixed inset-0 z-60 bg-background/80 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-card p-8 rounded-2xl shadow-xl border flex flex-col items-center max-w-sm text-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
            <h2 className="text-xl font-bold mb-2">Verifying Payment</h2>
            <p className="text-muted-foreground">
              Please wait while we confirm your transaction with Paystack...
            </p>
          </div>
        </div>
      )}
      <div className="container mx-auto px-4 md:px-6 space-y-6 pt-4 md:pt-20 pb-24 md:pb-8 mt-2 md:mt-6">
        <WalletHeader />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {isMobile ? (
            <>
              <div className="lg:col-span-2 space-y-6">
                <WalletBalance wallet={wallet} />
                <QuickTransfer baskets={baskets} balance={wallet.balance} />
              </div>
              <div>
                <TransactionHistory transactions={wallet.transactions} />
              </div>
            </>
          ) : (
            <>
              <div className="lg:col-span-2 space-y-6">
                <WalletBalance wallet={wallet} />
                <TransactionHistory transactions={wallet.transactions} />
              </div>
              <div>
                <QuickTransfer baskets={baskets} balance={wallet.balance} />
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

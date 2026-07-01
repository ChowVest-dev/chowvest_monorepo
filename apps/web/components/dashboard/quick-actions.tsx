"use client";

import { Card } from "@chowvest/ui";
import { Button } from "@chowvest/ui";
import { Plus, Package } from "lucide-react";
import { DepositModal } from "@/components/wallet/deposit-modal";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function QuickActions() {
  const [depositModalOpen, setDepositModalOpen] = useState(false);
  const router = useRouter();

  const handleAddMoney = () => {
    setDepositModalOpen(true);
  };

  const handleRequestDelivery = () => {
    // Navigate to basket goals with query param to open delivery dialog
    router.push("/basket-goals?deliveries=true");
  };

  return (
    <>
      <Card className="p-6" data-onboarding-id="quick-actions">
        <h3 className="text-xl font-semibold text-foreground mb-4">Quick Actions</h3>
        <div className="space-y-3">
          <Button
            variant="default"
            className="w-full justify-start gap-3 h-12"
            onClick={handleAddMoney}
          >
            <Plus className="w-5 h-5" />
            Fund Wallet
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start gap-3 h-12"
            onClick={handleRequestDelivery}
          >
            <Package className="w-5 h-5" />
            Bring it home
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 h-12 text-primary"
            asChild
          >
            <a href="https://wa.me/2347048683184" target="_blank" rel="noopener noreferrer">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
                <path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1" />
              </svg>
              Contact Support
            </a>
          </Button>
        </div>
      </Card>

      <DepositModal open={depositModalOpen} onOpenChange={setDepositModalOpen} />
    </>
  );
}
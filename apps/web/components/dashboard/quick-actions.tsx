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
        </div>
      </Card>

      <DepositModal open={depositModalOpen} onOpenChange={setDepositModalOpen} />
    </>
  );
}
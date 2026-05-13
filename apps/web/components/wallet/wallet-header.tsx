"use client";

import { ArrowDownToLine } from "lucide-react";
import { Button } from "@chowvest/ui";
import { DepositModal } from "@/components/wallet/deposit-modal";
import { FeatureDisabledOverlay } from "@/components/maintenance/FeatureDisabledOverlay";
import { useState } from "react";

export function WalletHeader() {
  const [depositModalOpen, setDepositModalOpen] = useState(false);

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground text-balance">
            Wallet
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your funds and transactions
          </p>
        </div>
        <FeatureDisabledOverlay feature="deposits">
          <div className="flex items-center gap-3">
            <Button
              data-onboarding-id="deposit-button"
              variant="outline"
              className="gap-2 bg-transparent"
              onClick={() => setDepositModalOpen(true)}
            >
              <ArrowDownToLine className="w-4 h-4" />
              Deposit
            </Button>
          </div>
        </FeatureDisabledOverlay>
      </div>

      <DepositModal open={depositModalOpen} onOpenChange={setDepositModalOpen} />
    </>
  );
}
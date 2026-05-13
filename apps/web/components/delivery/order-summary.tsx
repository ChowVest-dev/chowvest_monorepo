"use client";

import { MapPin, Package, Clock, Zap, Wallet, AlertCircle } from "lucide-react";
import Image from "next/image";
import { Button } from "@chowvest/ui";
import { useState } from "react";
import { DepositModal } from "@/components/wallet/deposit-modal";

interface OrderSummaryProps {
  basket: any;
  commodity: any;
  onSubmitRequestId: (deliveryData: any) => void;
  isSubmitting: boolean;
  walletBalance: number;
}

export function OrderSummary({ basket, commodity, onSubmitRequestId, isSubmitting, walletBalance }: OrderSummaryProps) {
  const [option, setOption] = useState<"STANDARD" | "EXPRESS" | "SCHEDULED">("STANDARD");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [insufficientFunds, setInsufficientFunds] = useState(false);

  const handleSubmit = () => {
    if (!address.trim()) return;

    const deliveryFee = option === "EXPRESS" ? 1200 : option === "STANDARD" ? 700 : 500;
    const serviceFee = 100;
    const totalFees = deliveryFee + serviceFee;

    if (walletBalance < totalFees) {
      setInsufficientFunds(true);
      return;
    }
    setInsufficientFunds(false);
    
    onSubmitRequestId({
      address: address,
      deliveryOption: option,
      deliveryNote: notes,
    });
  };

  const bundleImage = commodity?.image || basket.image || "/placeholder.svg";
  const bundleName = commodity ? `${commodity.name} (${commodity.size}${commodity.unit})` : basket.name;

  return (
    <div className="space-y-6">
      {/* Bundle Info Card */}
      <div className="bg-primary rounded-2xl p-5 text-white shadow-sm overflow-hidden relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center p-2 border border-white/20 mb-3">
             <span className="text-2xl">🎉</span>
          </div>
          <h2 className="text-lg font-bold text-primary-foreground mb-1">Basket Fully Funded! 🎉</h2>
          <p className="text-primary-foreground/80 text-xs">Your items are ready to be sent to your door.</p>
        </div>
      </div>

      <div className="bg-background border border-border rounded-2xl p-4 flex gap-4 shadow-sm">
        <div className="w-16 h-16 rounded-xl overflow-hidden bg-muted flex items-center justify-center relative shrink-0 border border-border">
          <Image src={bundleImage} alt={bundleName || "Commodity"} width={64} height={64} className="object-cover w-full h-full" />
        </div>
        <div className="flex-1 flex flex-col justify-center">
          <h3 className="text-sm font-bold text-foreground">{bundleName}</h3>
          <div className="text-xs text-muted-foreground mt-0.5">1 Item bundle</div>
          <div className="inline-block bg-[#FFF4E0] text-[#D4890A] font-bold text-[10px] px-2 py-0.5 rounded mt-2">Premium Quality</div>
        </div>
        <div className="text-right flex flex-col justify-center">
          <div className="text-sm font-bold text-primary">₦{basket.goalAmount.toLocaleString()}</div>
          <div className="text-primary/70 text-[10px] font-bold">Fully Saved</div>
        </div>
      </div>

      <div>
        <h3 className="text-[10px] font-bold text-muted-foreground mb-3 text-center tracking-wider">DELIVERY OPTION</h3>
        <div className="grid grid-cols-3 gap-2">
          {/* Option 1 */}
          <button 
             onClick={() => setOption("EXPRESS")}
             className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${
               option === "EXPRESS" ? "border-primary bg-primary/5" : "border-border bg-background hover:bg-muted"
             }`}
          >
            <Zap className={`w-5 h-5 mb-2 ${option === "EXPRESS" ? "text-[#F5A623]" : "text-muted-foreground"}`} />
            <div className={`text-xs font-bold ${option === "EXPRESS" ? "text-foreground" : "text-muted-foreground"}`}>Express</div>
            <div className="text-[10px] text-muted-foreground">Same day</div>
            <div className={`text-xs font-bold mt-1 ${option === "EXPRESS" ? "text-primary" : "text-muted-foreground"}`}>₦1,200</div>
          </button>
          
          {/* Option 2 */}
          <button 
             onClick={() => setOption("STANDARD")}
             className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${
               option === "STANDARD" ? "border-primary bg-primary/5" : "border-border bg-background hover:bg-muted"
             }`}
          >
            <Package className={`w-5 h-5 mb-2 ${option === "STANDARD" ? "text-orange-500" : "text-muted-foreground"}`} />
            <div className={`text-xs font-bold ${option === "STANDARD" ? "text-foreground" : "text-muted-foreground"}`}>Standard</div>
            <div className="text-[10px] text-muted-foreground">48 hours</div>
            <div className={`text-xs font-bold mt-1 ${option === "STANDARD" ? "text-primary" : "text-muted-foreground"}`}>₦700</div>
            
          </button>

          {/* Option 3 */}
          <button 
             onClick={() => setOption("SCHEDULED")}
             className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${
               option === "SCHEDULED" ? "border-primary bg-primary/5" : "border-border bg-background hover:bg-muted"
             }`}
          >
            <Clock className={`w-5 h-5 mb-2 ${option === "SCHEDULED" ? "text-primary" : "text-muted-foreground"}`} />
            <div className={`text-xs font-bold ${option === "SCHEDULED" ? "text-foreground" : "text-muted-foreground"}`}>Scheduled</div>
            <div className="text-[10px] text-muted-foreground">Pick date</div>
            <div className={`text-xs font-bold mt-1 ${option === "SCHEDULED" ? "text-primary" : "text-muted-foreground"}`}>₦500</div>
          </button>
        </div>
      </div>

      <div>
        <h3 className="text-[10px] font-bold text-muted-foreground mb-3 text-center tracking-wider">DELIVERY ADDRESS</h3>
        <div className="bg-background border border-border rounded-2xl overflow-hidden flex divide-x divide-border shadow-sm">
          <div className="w-12 flex items-center justify-center bg-muted/50">
             <MapPin className="w-4 h-4 text-destructive" />
          </div>
          <input 
            type="text" 
            placeholder="Enter delivery address..." 
            className="flex-1 bg-transparent px-4 py-3 text-sm font-medium outline-none placeholder:text-muted-foreground"
            value={address}
            onChange={(e: any) => setAddress(e.target.value)}
          />
        </div>

        <textarea 
          placeholder="Add delivery note (e.g. Call upon arrival)"
          className="mt-3 w-full bg-background border border-border rounded-xl resize-none h-16 text-sm p-3 outline-none focus:border-primary/50"
          value={notes}
          onChange={(e: any) => setNotes(e.target.value)}
        />
      </div>

      <div className="border-t border-border pt-4 mt-2">
         <div className="flex justify-between items-center mb-1">
            <span className="text-muted-foreground text-sm">Goal Value</span>
            <span className="text-foreground text-sm font-medium">₦{basket.goalAmount.toLocaleString()}</span>
         </div>
         <div className="flex justify-between items-center mb-1">
            <span className="text-muted-foreground text-sm">Delivery Fee</span>
            <span className="text-foreground text-sm font-medium">₦{option === "EXPRESS" ? "1,200" : option === "STANDARD" ? "700" : "500"}</span>
         </div>
         <div className="flex justify-between items-center mb-3">
            <span className="text-muted-foreground text-sm">Service Fee</span>
            <span className="text-foreground text-sm font-medium">₦100</span>
         </div>

         {insufficientFunds && (
           <div className="p-3 rounded-lg bg-red-50 border border-red-200 mt-3 mb-3">
             <div className="flex items-center gap-2 text-red-700 mb-2">
               <AlertCircle className="w-4 h-4 flex-shrink-0" />
               <p className="text-sm font-medium">Insufficient Wallet Balance</p>
             </div>
             <p className="text-xs text-red-600 mb-3">
               Total fees: ₦{((option === "EXPRESS" ? 1200 : option === "STANDARD" ? 700 : 500) + 100).toLocaleString()}. Your balance: ₦{walletBalance.toLocaleString()}
             </p>
             <Button
               variant="outline"
               size="sm"
               className="w-full gap-2 border-red-300 text-red-700 hover:bg-red-100 hover:text-red-800"
               onClick={() => setShowDepositModal(true)}
             >
               <Wallet className="w-4 h-4" />
               Fund Wallet to Continue
             </Button>
           </div>
         )}
         
         <Button 
            disabled={!address.trim() || isSubmitting}
            onClick={handleSubmit} 
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl h-14 text-[15px] font-bold shadow-md transition-all mt-4"
         >
            {isSubmitting ? "Processing..." : "Bring it home"}
         </Button>
      </div>

      <DepositModal open={showDepositModal} onOpenChange={setShowDepositModal} />

    </div>
  );
}

"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button, Badge, Switch, Card, CardContent, CardHeader, CardTitle, CardDescription, Separator } from "@chowvest/ui";
import { MapPin, Navigation, Phone, CheckCircle2, Package, Map as MapIcon, ExternalLink, Bike, ShieldCheck, ChevronRight, Truck } from "lucide-react";
import { updateDeliveryStatus, verifyAndCompleteDelivery, toggleRiderStatus } from "../actions";
import { toast } from "sonner";

export default function RiderDashboardClient({ rider, initialDelivery }: { rider: any, initialDelivery: any }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [pinInput, setPinInput] = useState("");
  const [error, setError] = useState("");

  const activeDelivery = initialDelivery;
  const isOnline = rider.status === "ONLINE";

  useEffect(() => {
    if (isOnline && !activeDelivery) {
      const interval = setInterval(() => {
        router.refresh();
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [isOnline, activeDelivery, router]);

  const deliveryStep = activeDelivery?.status;

  const handleToggleOnline = (checked: boolean) => {
    startTransition(async () => {
      await toggleRiderStatus(rider.id, checked);
    });
  };

  const handleUpdateStatus = (newStatus: string) => {
    startTransition(async () => {
      try {
        await updateDeliveryStatus(activeDelivery.id, newStatus);
        if (newStatus === "IN_TRANSIT") {
           toast.success("Trip started! Navigating to customer...");
        }
      } catch (err: any) {
        toast.error("Failed to update status");
      }
    });
  };

  const handleOpenNavigation = () => {
    if (!activeDelivery) return;
    if (deliveryStep !== "IN_TRANSIT") {
      handleUpdateStatus("IN_TRANSIT");
    }

    const { lat, lng, address } = activeDelivery;
    const url = lat && lng 
      ? `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
    
    window.open(url, "_blank");
  };

  const handleComplete = async () => {
    setError("");
    startTransition(async () => {
      try {
        await verifyAndCompleteDelivery(activeDelivery.id, pinInput);
        setPinInput("");
        toast.success("Delivery completed!");
      } catch (err: any) {
        setError(err.message);
      }
    });
  };

  // HEADER COMPONENT
  const Header = () => (
    <div className="bg-white border-b sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
          <img src="/chowvest-logo-nobg.png" className="w-5 h-5 object-contain" alt="Logo" />
        </div>
        <div>
          <h1 className="font-bold text-sm uppercase tracking-tight leading-none">Rider Hub</h1>
          <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest mt-1">Operational Fleet</p>
        </div>
      </div>
      <Badge variant={isOnline ? "default" : "secondary"} className="rounded-full px-3 py-0.5 text-[10px] font-bold">
        {isOnline ? "ONLINE" : "OFFLINE"}
      </Badge>
    </div>
  );

  if (!isOnline && !activeDelivery) {
    return (
      <div className="min-h-screen bg-muted/20 flex flex-col">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-6">
          <div className="w-20 h-20 bg-white border rounded-full flex items-center justify-center shadow-sm">
             <Bike className="w-10 h-10 text-muted-foreground opacity-20" />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-bold">You are currently Offline</h2>
            <p className="text-sm text-muted-foreground">Toggle to online to start receiving assignments.</p>
          </div>
          <Card className="w-full max-w-xs border-none shadow-sm">
            <CardContent className="p-4 flex items-center justify-between">
               <span className="font-semibold text-sm">Status</span>
               <Switch checked={isOnline} onCheckedChange={handleToggleOnline} disabled={isPending} />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (isOnline && !activeDelivery) {
    return (
      <div className="min-h-screen bg-muted/20 flex flex-col">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-8">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping scale-150"></div>
            <div className="relative w-20 h-20 bg-white border-2 border-primary/20 rounded-full flex items-center justify-center shadow-lg">
              <MapPin className="w-10 h-10 text-primary" />
            </div>
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-bold">Looking for Assignments</h2>
            <p className="text-sm text-muted-foreground">Stay tuned! We'll notify you as soon as an order is ready.</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => handleToggleOnline(false)} disabled={isPending} className="rounded-full px-6">
            Go Offline
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/20 flex flex-col">
      <Header />
      
      <main className="p-6 space-y-6 flex-1 max-w-md mx-auto w-full">
        
        <Card className="border-none shadow-sm overflow-hidden">
          <CardHeader className="bg-muted/30 border-b py-3 px-5">
             <div className="flex items-center justify-between">
                <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                  <Package className="w-4 h-4 text-primary" /> Active Order
                </CardTitle>
                <Badge className="bg-primary/10 text-primary border-none text-[10px] font-black rounded-full px-3">
                  #{activeDelivery.id.slice(-6).toUpperCase()}
                </Badge>
             </div>
          </CardHeader>
          
          <CardContent className="p-0">
             <div className="p-5 space-y-6">
                {["PENDING", "CONFIRMED", "PREPARING"].includes(deliveryStep) ? (
                  <div className="space-y-4">
                    <div>
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-wider mb-1">Pickup Location</p>
                      <h3 className="text-xl font-bold leading-tight">Chowvest Central Hub</h3>
                      <p className="text-sm text-muted-foreground mt-1">Ikeja, Lagos State</p>
                    </div>
                    <div className="bg-primary/5 rounded-xl p-4 flex items-start gap-3 border border-primary/10">
                       <ShieldCheck className="w-5 h-5 text-primary shrink-0" />
                       <p className="text-xs font-medium text-primary">Verify items and quantities before confirming pickup.</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <div>
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-wider mb-1">Drop-off Address</p>
                        <h3 className="text-xl font-bold leading-tight">{activeDelivery.address}</h3>
                        <Badge variant="outline" className="mt-2 text-[10px] font-bold border-muted uppercase tracking-wider">
                          {activeDelivery.addressLabel || "Home"}
                        </Badge>
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                         <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-muted rounded-xl flex items-center justify-center font-bold">
                               {activeDelivery.user.fullName.charAt(0)}
                            </div>
                            <div>
                               <p className="text-[10px] font-black text-muted-foreground uppercase tracking-wider leading-none mb-1">Recipient</p>
                               <p className="font-bold text-sm">{activeDelivery.user.fullName}</p>
                            </div>
                         </div>
                         <Button size="icon" variant="secondary" className="rounded-xl" asChild>
                           <a href={`tel:${activeDelivery.user.phoneNumber}`}><Phone className="w-4 h-4" /></a>
                         </Button>
                      </div>
                    </div>
                  </div>
                )}
             </div>

             <div className="p-5 bg-muted/20 border-t">
                {deliveryStep === "PENDING" && (
                   <Button onClick={() => handleUpdateStatus("CONFIRMED")} disabled={isPending} className="w-full font-bold h-12 rounded-xl">
                     Arrived at Pickup Location
                   </Button>
                )}

                {deliveryStep === "CONFIRMED" && (
                   <Button onClick={() => handleUpdateStatus("PREPARING")} disabled={isPending} className="w-full font-bold h-12 rounded-xl">
                     Confirm Items Pickup
                   </Button>
                )}

                {deliveryStep === "PREPARING" && (
                   <Button onClick={handleOpenNavigation} className="w-full font-bold h-12 rounded-xl bg-blue-600 hover:bg-blue-700 flex items-center justify-center gap-2">
                     <Navigation className="w-4 h-4" /> Start Navigation
                   </Button>
                )}

                {deliveryStep === "IN_TRANSIT" && (
                   <div className="grid grid-cols-2 gap-3">
                      <Button onClick={handleOpenNavigation} variant="outline" className="font-bold h-12 rounded-xl flex items-center gap-2">
                        <Navigation className="w-4 h-4" /> Navigating
                      </Button>
                      <Button onClick={() => handleUpdateStatus("AT_CUSTOMER")} disabled={isPending} className="font-bold h-12 rounded-xl bg-green-600 hover:bg-green-700">
                        I Have Arrived
                      </Button>
                   </div>
                )}

                {deliveryStep === "AT_CUSTOMER" && (
                   <div className="space-y-4">
                      <div className="relative">
                        <input 
                          type="text" 
                          maxLength={4}
                          value={pinInput}
                          onChange={(e) => setPinInput(e.target.value)}
                          placeholder="Enter Customer PIN"
                          className="w-full text-center text-2xl tracking-[0.5em] font-bold h-14 rounded-xl border-2 border-muted focus:border-primary outline-none transition-all"
                        />
                        {error && <p className="text-center text-[10px] text-red-500 font-bold mt-2">{error}</p>}
                      </div>
                      <Button onClick={handleComplete} disabled={isPending || pinInput.length !== 4} className="w-full font-bold h-12 rounded-xl bg-green-600 hover:bg-green-700">
                        {isPending ? "Verifying..." : "Handover Completed"}
                      </Button>
                   </div>
                )}
             </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

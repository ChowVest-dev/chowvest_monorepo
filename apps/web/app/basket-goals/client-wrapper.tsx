"use client";

import { Box, Target } from "lucide-react";
import { CreateGoalCard } from "@/components/goals/create-goal-card";
import { GoalsList } from "@/components/goals/goals-list";
import { GoalsHeader } from "@/components/goals/goals-header";
import { useState, useEffect, useCallback, Suspense } from "react";
import axios from "axios";
import { BouncingDots } from "@chowvest/ui";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@chowvest/ui";
import { Card } from "@chowvest/ui";
import { Button } from "@chowvest/ui";
import { Badge } from "@chowvest/ui";
import Image from "next/image";
import { format } from "date-fns";
import { useRouter, useSearchParams } from "next/navigation";

// ... [rest of interfaces and component definition unchanged]

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
  createdAt: string;
}

interface BasketGoalsClientWrapperProps {
  serializedBaskets: Basket[];
  walletBalance: number;
  initialActiveDeliveriesCount: number;
}

function BasketGoalsClientInner({
  serializedBaskets,
  walletBalance: initialWalletBalance,
  initialActiveDeliveriesCount,
}: BasketGoalsClientWrapperProps) {
  const [baskets, setBaskets] = useState<Basket[]>(serializedBaskets);
  const [walletBalance, setWalletBalance] = useState(initialWalletBalance);
  const [activeDeliveriesCount, setActiveDeliveriesCount] = useState(initialActiveDeliveriesCount);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showDeliveriesDialog, setShowDeliveriesDialog] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("deliveries") === "true") {
      setShowDeliveriesDialog(true);
    }
  }, [searchParams]);

  const completedBaskets = baskets.filter(
    (b: any) => 
      ((b.status === "ACTIVE" && b.currentAmount >= b.goalAmount) || b.status === "COMPLETED") && 
      (!b.deliveries || b.deliveries.filter((d: any) => d.status !== "CANCELLED").length === 0)
  );

  const fetchBaskets = useCallback(async () => {
    try {
      setIsRefreshing(true);
      const response = await axios.get("/api/baskets");
      // Handle the data carefully as API might return strings for Decimals
      const fetchedBaskets = (response.data.baskets || []).map((b: any) => ({
        ...b,
        goalAmount: Number(b.goalAmount),
        currentAmount: Number(b.currentAmount),
        regularTopUp: b.regularTopUp ? Number(b.regularTopUp) : null,
      }));
      setBaskets(fetchedBaskets);
      setWalletBalance(response.data.walletBalance || 0);
      setActiveDeliveriesCount(response.data.activeDeliveriesCount || 0);
    } catch (error) {
      console.error("Error fetching baskets:", error);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  // Poll for updates every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchBaskets();
    }, 10000);

    return () => clearInterval(interval);
  }, [fetchBaskets]);

  // Function to manually refresh (can be called from child components)
  const handleRefresh = useCallback(() => {
    fetchBaskets();
  }, [fetchBaskets]);

  return (
    <div className="container mx-auto px-4 md:px-6 space-y-6 pt-4 md:pt-20 pb-24 md:pb-8 mt-2 md:mt-6">
      <GoalsHeader
        completedGoalsCount={completedBaskets.length}
        activeDeliveriesCount={activeDeliveriesCount}
        onViewDeliveries={() => setShowDeliveriesDialog(true)}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="order-2 lg:order-1 lg:col-span-2">
          <GoalsList
            baskets={baskets}
            balance={walletBalance}
            onUpdate={handleRefresh}
          />
        </div>
        <div className="order-1 lg:order-2" data-onboarding-id="create-target-button">
          <CreateGoalCard onGoalCreated={handleRefresh} />
        </div>
      </div>

      {/* Deliveries Dialog */}
      <Dialog
        open={showDeliveriesDialog}
        onOpenChange={setShowDeliveriesDialog}
      >
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <Target className="w-5 h-5 text-green-600" />
              </div>
              🎉 Your basket is ready!
            </DialogTitle>
            <DialogDescription>
              Great job! Your food is ready to be delivered to your door.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            {completedBaskets.length === 0 ? (
              <div className="col-span-full text-center py-12 text-muted-foreground bg-muted/20 rounded-2xl border-2 border-dashed border-border">
                <Box className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p className="font-medium">Your delivery list is empty. Reach 100% to ship!</p>
                <p className="text-xs">Keep saving to reach your food targets!</p>
              </div>
            ) : (
              completedBaskets.map((basket) => {
                const displayName = basket.name;
                const displayImage = basket.image || "/rice.jpg";

                return (
                  <Card 
                    key={basket.id} 
                    className="group bg-background border-2 border-border hover:border-primary/30 rounded-[28px] overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                  >
                    <div className="p-8 flex flex-col items-center text-center">
                      <div className="relative mb-6">
                        <div className="w-28 h-28 rounded-3xl overflow-hidden shadow-md border-4 border-white">
                          <Image
                            src={displayImage}
                            alt={displayName}
                            width={112}
                            height={112}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="absolute -top-2 -right-2 bg-green-500 text-white p-1.5 rounded-full shadow-lg border-2 border-white">
                          <Target className="w-4 h-4" />
                        </div>
                      </div>

                      <div className="space-y-1.5 mb-8">
                        <h3 className="font-bold text-xl tracking-tight text-foreground line-clamp-1">
                          {displayName}
                        </h3>
                        <div className="flex items-center justify-center gap-2">
                          <span className="text-xs font-bold text-primary uppercase tracking-widest bg-primary/10 px-2 py-0.5 rounded-md">
                            100% REACHED
                          </span>
                        </div>
                      </div>

                      <div className="text-xs text-muted-foreground mb-8">
                        We&apos;ll have this at your door in 24-48 hours.
                      </div>

                      <Button
                        onClick={() => {
                          setShowDeliveriesDialog(false);
                          router.push(`/basket-goals/delivery/${basket.id}`);
                        }}
                        className="w-full h-14 bg-green-600 hover:bg-green-700 text-white font-bold rounded-2xl shadow-lg shadow-green-600/20 transition-all active:scale-95 flex items-center justify-center gap-3"
                      >
                        Deliver My Basket
                      </Button>
                    </div>
                  </Card>
                );
              })
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function BasketGoalsClientWrapper(props: BasketGoalsClientWrapperProps) {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-20"><BouncingDots dots={3} className="w-3 h-3 bg-primary" message="Loading goals..." /></div>}>
      <BasketGoalsClientInner {...props} />
    </Suspense>
  );
}

"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@chowvest/ui";
import { Button } from "@chowvest/ui";
import { TrendingUp, TrendingDown, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export function PriceChangeModal() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [currentNotification, setCurrentNotification] = useState<any | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Fetch unread notifications
    const fetchNotifications = async () => {
      try {
        const res = await axios.get("/api/notifications?unreadOnly=true");
        if (res.data?.notifications) {
          const priceChangeNotifications = res.data.notifications.filter(
            (n: any) => n.type === "goal_price_change"
          );
          if (priceChangeNotifications.length > 0) {
            setNotifications(priceChangeNotifications);
            setCurrentNotification(priceChangeNotifications[0]);
            setIsOpen(true);
          }
        }
      } catch (error) {
        // Ignore 401s if not logged in
        console.error("Failed to fetch notifications for price change modal", error);
      }
    };

    fetchNotifications();
  }, []);

  const handleAcknowledge = async () => {
    if (!currentNotification) return;

    setIsLoading(true);
    try {
      await axios.patch("/api/notifications", {
        notificationIds: [currentNotification.id],
      });

      // Remove the acknowledged notification
      const remaining = notifications.filter((n) => n.id !== currentNotification.id);
      setNotifications(remaining);

      if (remaining.length > 0) {
        setCurrentNotification(remaining[0]);
      } else {
        setIsOpen(false);
        setCurrentNotification(null);
      }
    } catch (error) {
      console.error("Failed to acknowledge notification", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewGoal = async () => {
    await handleAcknowledge();
    router.push("/basket-goals");
  };

  if (!currentNotification) return null;

  const { title, metadata } = currentNotification;
  const isIncrease = metadata?.direction === "increased";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      // Prevent closing without acknowledging
      if (!open && !isLoading) {
        // Optionally allow closing by setting isOpen(false)
        // setIsOpen(false);
      }
    }}>
      <DialogContent className="max-w-md sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                isIncrease ? "bg-amber-100" : "bg-green-100"
              }`}
            >
              {isIncrease ? (
                <TrendingUp className="w-5 h-5 text-amber-600" />
              ) : (
                <TrendingDown className="w-5 h-5 text-green-600" />
              )}
            </div>
            <DialogTitle className="text-xl">{title}</DialogTitle>
          </div>
          <DialogDescription className="text-base mt-4 text-foreground/80 space-y-4">
            <p>
              The market price for <strong>{metadata?.basketName}</strong> has{" "}
              {metadata?.direction} to{" "}
              <strong className={isIncrease ? "text-amber-600" : "text-green-600"}>
                ₦{Number(metadata?.newPrice).toLocaleString()}
              </strong>
              .
            </p>

            <div className="bg-muted p-4 rounded-lg flex items-start gap-3 border border-border">
              <AlertCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <p className="text-sm">
                {isIncrease
                  ? `Don't worry! Your locked price of ₦${Number(
                      metadata?.lockedPrice
                    ).toLocaleString()} still applies. Keep saving towards your original goal.`
                  : `Great news! You still save towards your locked price of ₦${Number(
                      metadata?.lockedPrice
                    ).toLocaleString()}, but any excess will be refunded to your wallet when you complete the goal.`}
              </p>
            </div>
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="mt-6 flex flex-col sm:flex-row gap-2 sm:gap-0">
          <Button
            variant="outline"
            className="w-full sm:w-auto"
            onClick={handleViewGoal}
            disabled={isLoading}
          >
            View My Goal
          </Button>
          <Button
            className="w-full sm:w-auto"
            onClick={handleAcknowledge}
            disabled={isLoading}
          >
            {isLoading ? "Processing..." : "I Understand"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

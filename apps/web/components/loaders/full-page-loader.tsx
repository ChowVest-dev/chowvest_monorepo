"use client";

import { useEffect, useState } from "react";
import { cn } from "@chowvest/shared";
import { BouncingDots } from "@chowvest/ui";
import Image from "next/image";

interface FullPageLoaderProps {
  message?: string;
  show?: boolean;
}

export function FullPageLoader({
  message = "Loading...",
  show = true,
}: FullPageLoaderProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
    } else {
      // Delay hiding to allow fade-out animation
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [show]);

  if (!isVisible) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center bg-background transition-opacity duration-300",
        show ? "opacity-100" : "opacity-0"
      )}
      style={{ pointerEvents: show ? "auto" : "none" }}
    >
      <div className="flex flex-col items-center gap-6">
        {/* Chowvest Logo with Pulse Animation */}
        <div className="w-15 h-15 flex items-center justify-center bg-accent rounded-full">
              <Image src="/chowvest-logo-nobg.png" width={100} height={100} alt="Chowvest logo" className="w-15 h-15 object-contain" />
            </div>

        {/* Loading Message */}
        <div className="flex flex-col items-center gap-3">
          <BouncingDots dots={3} className="w-2.5 h-2.5 bg-primary" />
          <p className="text-sm font-medium text-muted-foreground">{message}</p>
        </div>
      </div>
    </div>
  );
}


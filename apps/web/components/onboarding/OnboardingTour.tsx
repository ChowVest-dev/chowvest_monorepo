"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { useSession } from "@/components/providers/session-provider";
import { TooltipCard } from "./TooltipCard";
import axios from "axios";

interface SpotlightRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

interface OnboardingStep {
  id: string;
  path: string;
  headline: string;
  description: string;
}

const STEPS: OnboardingStep[] = [
  // --- DASHBOARD ---
  {
    id: "total-saved",
    path: "/dashboard",
    headline: "Your Total Savings",
    description: "This is the total value of all the food items you've secured so far against inflation.",
  },
  {
    id: "wallet-balance",
    path: "/dashboard",
    headline: "Wallet Balance",
    description: "Your ready-to-use cash. Use this to top up your baskets or buy directly from the market.",
  },
  {
    id: "active-baskets",
    path: "/dashboard",
    headline: "Your Active Baskets",
    description: "Monitor your ongoing savings goals. Once a basket is 100% full, it's ready for delivery!",
  },
  {
    id: "quick-actions",
    path: "/dashboard",
    headline: "Fast Actions",
    description: "Quickly fund your wallet or request a delivery for your completed baskets from here.",
  },

  // --- WALLET ---
  {
    id: "deposit-button",
    path: "/wallet",
    headline: "Add Funds",
    description: "Click here to fund your wallet instantly via card or bank transfer.",
  },
  {
    id: "transaction-history",
    path: "/wallet",
    headline: "Activity Log",
    description: "Track every deposit, transfer, and purchase you've made within the app.",
  },
  {
    id: "quick-transfer",
    path: "/wallet",
    headline: "Move Funds",
    description: "Easily move money from your wallet into any of your active food baskets.",
  },

  // --- MY BASKET ---
  {
    id: "goals-header",
    path: "/basket-goals",
    headline: "Basket Overview",
    description: "See a summary of your savings and how many baskets are ready for delivery.",
  },
  {
    id: "create-target-button",
    path: "/basket-goals",
    headline: "Start a New Goal",
    description: "Pick a new commodity and start saving towards it at today's locked-in price.",
  },
  {
    id: "goals-list",
    path: "/basket-goals",
    headline: "Track Progress",
    description: "Monitor exactly how much you've saved and how close you are to completing each goal.",
  },

  // --- DELIVERIES ---
  {
    id: "deliveries-header",
    path: "/deliveries",
    headline: "Live Tracking",
    description: "Follow your filled baskets as they leave our warehouse and head to your doorstep.",
  },

  // --- MARKET ---
  {
    id: "market-header",
    path: "/market",
    headline: "Direct Marketplace",
    description: "Soon you'll be able to bypass the savings goals and buy food items for immediate delivery.",
  },

  // --- PROFILE ---
  {
    id: "profile-stats",
    path: "/profile",
    headline: "Your Milestones",
    description: "Check your historical achievements and overall savings growth over time.",
  },
];

const PADDING = 12;
const TOOLTIP_WIDTH = 320;
const TOOLTIP_HEIGHT_ESTIMATE = 280;

function waitForElement(id: string, timeout = 6000): Promise<Element | null> {
  return new Promise((resolve) => {
    const selector = `[data-onboarding-id="${id}"]`;
    
    // Check immediately
    const existing = document.querySelector(selector);
    if (existing) {
      resolve(existing);
      return;
    }

    const deadline = Date.now() + timeout;
    let rafId: number;

    const check = () => {
      const el = document.querySelector(selector);
      if (el) {
        resolve(el);
        return;
      }
      if (Date.now() > deadline) {
        console.warn(`Onboarding: Element ${id} not found after ${timeout}ms`);
        resolve(null);
        return;
      }
      rafId = requestAnimationFrame(check);
    };

    rafId = requestAnimationFrame(check);
  });
}

function getSpotlightRect(el: Element): SpotlightRect {
  const rect = el.getBoundingClientRect();
  return {
    top: rect.top - PADDING,
    left: rect.left - PADDING,
    width: rect.width + PADDING * 2,
    height: rect.height + PADDING * 2,
  };
}

function calculateTooltipPosition(
  sr: SpotlightRect,
  vw: number,
  vh: number
): { top: number; left: number } {
  const gap = 16;

  // Try right
  const rightLeft = sr.left + sr.width + gap;
  if (rightLeft + TOOLTIP_WIDTH < vw) {
    return {
      top: Math.max(8, Math.min(sr.top, vh - TOOLTIP_HEIGHT_ESTIMATE - 8)),
      left: rightLeft,
    };
  }

  // Try left
  const leftLeft = sr.left - TOOLTIP_WIDTH - gap;
  if (leftLeft > 0) {
    return {
      top: Math.max(8, Math.min(sr.top, vh - TOOLTIP_HEIGHT_ESTIMATE - 8)),
      left: leftLeft,
    };
  }

  // Fallback: below
  return {
    top: Math.min(sr.top + sr.height + gap, vh - TOOLTIP_HEIGHT_ESTIMATE - 8),
    left: Math.max(8, Math.min(sr.left, vw - TOOLTIP_WIDTH - 8)),
  };
}

export function OnboardingTour() {
  const { user, loading, refetch } = useSession();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [spotlightRect, setSpotlightRect] = useState<SpotlightRect | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const activeElRef = useRef<Element | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const updateRect = useCallback(() => {
    if (activeElRef.current) {
      setSpotlightRect(getSpotlightRect(activeElRef.current));
    }
  }, []);

  useEffect(() => {
    window.addEventListener("resize", updateRect, { passive: true });
    window.addEventListener("scroll", updateRect, { passive: true });
    return () => {
      window.removeEventListener("resize", updateRect);
      window.removeEventListener("scroll", updateRect);
    };
  }, [updateRect]);

  const activateStep = useCallback(
    async (index: number) => {
      const step = STEPS[index];
      setIsNavigating(true);
      setSpotlightRect(null);

      router.push(step.path);

      // Wait a tick for navigation to start before polling
      await new Promise((r) => setTimeout(r, 100));

      const el = await waitForElement(step.id);
      activeElRef.current = el;

      if (el) {
        // Scroll element into view if needed
        el.scrollIntoView({ block: "center", behavior: "smooth" });
        
        // Wait longer for smooth scroll and rendering
        await new Promise((r) => setTimeout(r, 600));
        
        // Final rect capture
        setSpotlightRect(getSpotlightRect(el));
      } else {
        setSpotlightRect(null);
      }

      setIsNavigating(false);
    },
    [router]
  );

  // Poll for rect updates to ensure highlight stays synced even if layout shifts
  useEffect(() => {
    if (!mounted || user?.hasCompletedOnboarding) return;
    
    const interval = setInterval(() => {
      if (activeElRef.current) {
        setSpotlightRect(getSpotlightRect(activeElRef.current));
      }
    }, 500);
    
    return () => clearInterval(interval);
  }, [mounted, user?.hasCompletedOnboarding]);

  // Activate first step when component becomes relevant
  useEffect(() => {
    if (!mounted) return;
    if (loading) return;
    if (!user) return;
    if (user.hasCompletedOnboarding) return;

    activateStep(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, loading, user?.id, user?.hasCompletedOnboarding]);

  const markComplete = useCallback(async () => {
    try {
      await axios.patch("/api/user/onboarding");
      await refetch();
    } catch (err) {
      console.error("Failed to mark onboarding complete", err);
    }
  }, [refetch]);

  const handleNext = useCallback(async () => {
    if (stepIndex < STEPS.length - 1) {
      const next = stepIndex + 1;
      setStepIndex(next);
      await activateStep(next);
    } else {
      await markComplete();
    }
  }, [stepIndex, activateStep, markComplete]);

  const handlePrev = useCallback(async () => {
    if (stepIndex > 0) {
      const prev = stepIndex - 1;
      setStepIndex(prev);
      await activateStep(prev);
    }
  }, [stepIndex, activateStep]);

  const handleSkip = useCallback(async () => {
    await markComplete();
  }, [markComplete]);

  // Don't render if: portal not ready, loading, no user, or tour already done
  if (!mounted || loading || !user || user.hasCompletedOnboarding) {
    return null;
  }

  const step = STEPS[stepIndex];
  const vw = typeof window !== "undefined" ? window.innerWidth : 1280;
  const vh = typeof window !== "undefined" ? window.innerHeight : 800;

  const tooltipPosition = spotlightRect
    ? calculateTooltipPosition(spotlightRect, vw, vh)
    : { top: vh / 2 - 140, left: vw / 2 - 160 };

  return createPortal(
    <div className="fixed inset-0 z-[9998]" aria-modal="true" role="dialog">
      {/* Dark overlay with spotlight cutout */}
      <svg
        className="fixed inset-0 w-full h-full pointer-events-none"
        style={{ zIndex: 9998 }}
        aria-hidden="true"
      >
        <defs>
          <mask id="onboarding-mask">
            {/* White = visible overlay */}
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            {/* Black = cutout (transparent "spotlight" hole) */}
            {spotlightRect && (
              <rect
                x={spotlightRect.left}
                y={spotlightRect.top}
                width={spotlightRect.width}
                height={spotlightRect.height}
                rx="12"
                ry="12"
                fill="black"
              />
            )}
          </mask>
        </defs>

        {/* The dimming overlay, cut out at spotlight rect */}
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="rgba(0,0,0,0.72)"
          mask="url(#onboarding-mask)"
        />

        {/* Spotlight border ring */}
        {spotlightRect && (
          <rect
            x={spotlightRect.left}
            y={spotlightRect.top}
            width={spotlightRect.width}
            height={spotlightRect.height}
            rx="12"
            ry="12"
            fill="none"
            stroke="oklch(0.55 0.15 145)"
            strokeWidth="2"
            strokeDasharray={isNavigating ? "6 4" : "0"}
            opacity="0.9"
            style={{ filter: "drop-shadow(0 0 8px oklch(0.55 0.15 145 / 0.6))" }}
          />
        )}
      </svg>

      {/* Clickable backdrop to skip — only outside spotlight */}
      <div
        className="fixed inset-0"
        style={{ zIndex: 9999 }}
        onClick={() => {
          // Only skip if clicking clearly outside the spotlight area
        }}
      />

      {/* Loading indicator when navigating */}
      {isNavigating && (
        <div
          className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-card border border-border rounded-full px-4 py-2 shadow-lg text-sm text-muted-foreground"
          style={{ zIndex: 10001 }}
        >
          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          Navigating…
        </div>
      )}

      {/* Tooltip card */}
      <div style={{ zIndex: 10000, position: "fixed", top: 0, left: 0, pointerEvents: "none", width: "100%", height: "100%" }}>
        <div style={{ pointerEvents: "all" }}>
          <TooltipCard
            stepIndex={stepIndex}
            totalSteps={STEPS.length}
            stepId={step.id}
            headline={step.headline}
            description={step.description}
            position={tooltipPosition}
            onNext={handleNext}
            onPrev={handlePrev}
            onSkip={handleSkip}
            isFirst={stepIndex === 0}
            isLast={stepIndex === STEPS.length - 1}
          />
        </div>
      </div>
    </div>,
    document.body
  );
}

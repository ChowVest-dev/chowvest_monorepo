"use client";

import { useFeatureFlags } from "@/hooks/use-feature-flags";
import type { FeatureFlags } from "@/lib/feature-flags";

interface FeatureDisabledOverlayProps {
  /** Which feature flag to check */
  feature: keyof FeatureFlags;
  /** Optional custom tooltip when disabled */
  message?: string;
  /** The children to render when the feature is enabled */
  children: React.ReactNode;
}

const defaultMessages: Record<keyof FeatureFlags, string> = {
  deposits: "Deposits are temporarily paused",
  withdrawals: "Withdrawals are temporarily paused",
  market: "Marketplace is temporarily paused",
};

/**
 * Wraps a section of the UI. When the feature is disabled,
 * the children are greyed out and unclickable with a subtle tooltip.
 *
 * Usage:
 * ```tsx
 * <FeatureDisabledOverlay feature="deposits">
 *   <DepositButton />
 * </FeatureDisabledOverlay>
 * ```
 */
export function FeatureDisabledOverlay({
  feature,
  message,
  children,
}: FeatureDisabledOverlayProps) {
  const { flags, isLoading } = useFeatureFlags();

  // While loading or if the feature is enabled, show children normally
  if (isLoading || flags[feature]) {
    return <>{children}</>;
  }

  const label = message || defaultMessages[feature];

  return (
    <div className="relative group cursor-not-allowed">
      {/* Dimmed, non-interactive children */}
      <div className="pointer-events-none select-none opacity-40 grayscale">
        {children}
      </div>

      {/* Minimal tooltip on hover */}
      <div className="absolute left-1/2 -translate-x-1/2 -bottom-9 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-20 whitespace-nowrap">
        <div className="bg-foreground text-background text-xs font-medium px-3 py-1.5 rounded-md shadow-lg">
          {label}
          {/* Tooltip arrow */}
          <div className="absolute left-1/2 -translate-x-1/2 -top-1 w-2 h-2 bg-foreground rotate-45" />
        </div>
      </div>
    </div>
  );
}

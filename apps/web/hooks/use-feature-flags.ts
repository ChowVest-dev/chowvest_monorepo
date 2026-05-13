"use client";

import { useEffect, useState } from "react";
import type { FeatureFlags } from "@/lib/feature-flags";

const CACHE_KEY = "chowvest-feature-flags";
const CACHE_TTL = 30_000; // 30 seconds

interface CachedFlags {
  flags: FeatureFlags;
  timestamp: number;
}

const defaultFlags: FeatureFlags = {
  deposits: true,
  withdrawals: true,
  market: true,
};

/**
 * Client-side hook to fetch and cache feature flags.
 * Flags are cached in sessionStorage for 30s to avoid
 * excessive API calls while still picking up changes quickly.
 */
export function useFeatureFlags() {
  const [flags, setFlags] = useState<FeatureFlags>(defaultFlags);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check sessionStorage cache first
    if (typeof window !== "undefined") {
      try {
        const cached = sessionStorage.getItem(CACHE_KEY);
        if (cached) {
          const parsed: CachedFlags = JSON.parse(cached);
          if (Date.now() - parsed.timestamp < CACHE_TTL) {
            setFlags(parsed.flags);
            setIsLoading(false);
            return;
          }
        }
      } catch {
        // Ignore parse errors
      }
    }

    fetch("/api/maintenance/status")
      .then((res) => res.json())
      .then((data) => {
        if (data.features) {
          setFlags(data.features);

          // Cache in sessionStorage
          if (typeof window !== "undefined") {
            const cached: CachedFlags = {
              flags: data.features,
              timestamp: Date.now(),
            };
            sessionStorage.setItem(CACHE_KEY, JSON.stringify(cached));
          }
        }
      })
      .catch(() => {
        // On failure, assume everything is enabled (fail-open)
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  return { flags, isLoading };
}

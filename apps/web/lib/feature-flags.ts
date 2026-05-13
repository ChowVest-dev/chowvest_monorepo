/**
 * Feature Flags & Maintenance Configuration
 *
 * All flags are controlled via environment variables.
 * On Vercel, updating an env var takes effect immediately for Edge Middleware
 * and on the next serverless invocation for API routes / RSC.
 *
 * Defaults are "enabled" — set the var to "false" to disable.
 */

export interface FeatureFlags {
  deposits: boolean;
  withdrawals: boolean;
  market: boolean;
}

export interface MaintenanceStatus {
  maintenance: boolean;
  message: string | null;
  banner: string | null;
  features: FeatureFlags;
}

/**
 * Read feature flags from environment variables (server-side only).
 */
export function getFeatureFlags(): FeatureFlags {
  return {
    deposits: process.env.FEATURE_DEPOSITS_ENABLED !== "false",
    withdrawals: process.env.FEATURE_WITHDRAWALS_ENABLED !== "false",
    market: process.env.FEATURE_MARKET_ENABLED !== "false",
  };
}

/**
 * Check if the platform is in full maintenance mode.
 */
export function isMaintenanceMode(): boolean {
  return process.env.MAINTENANCE_MODE === "true";
}

/**
 * Get the custom message to display on the maintenance page.
 */
export function getMaintenanceMessage(): string | null {
  return process.env.MAINTENANCE_MESSAGE || null;
}

/**
 * Get the warning banner text (soft kill switch).
 * Returns null if no banner should be shown.
 */
export function getMaintenanceBanner(): string | null {
  return process.env.MAINTENANCE_BANNER || null;
}

/**
 * Get the full maintenance status object (used by the status API).
 */
export function getMaintenanceStatus(): MaintenanceStatus {
  return {
    maintenance: isMaintenanceMode(),
    message: getMaintenanceMessage(),
    banner: getMaintenanceBanner(),
    features: getFeatureFlags(),
  };
}

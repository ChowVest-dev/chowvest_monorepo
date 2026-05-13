import { prisma } from "@chowvest/database";
import { headers } from "next/headers";

interface RateLimitConfig {
  identifier: string; // userId, IP, or API key
  action: string;
  maxAttempts: number;
  windowMinutes: number;
}

/**
 * Check if rate limit is exceeded
 */
export async function checkRateLimit(
  config: RateLimitConfig
): Promise<boolean> {
  const { identifier, action, maxAttempts, windowMinutes } = config;

  const windowStart = new Date(Date.now() - windowMinutes * 60 * 1000);
  const windowEnd = new Date(Date.now() + windowMinutes * 60 * 1000);

  // Count recent attempts
  const recentAttempts = await prisma.rateLimitLog.count({
    where: {
      identifier,
      action,
      windowStart: {
        gte: windowStart,
      },
    },
  });

  if (recentAttempts >= maxAttempts) {
    // Log the rate limit violation
    await prisma.rateLimitLog.create({
      data: {
        identifier,
        action,
        count: recentAttempts + 1,
        windowStart,
        windowEnd,
        blocked: true,
      },
    });
    return true; // Rate limit exceeded
  }

  // Log this attempt
  await prisma.rateLimitLog.create({
    data: {
      identifier,
      action,
      count: recentAttempts + 1,
      windowStart,
      windowEnd,
      blocked: false,
    },
  });

  return false; // Within rate limit
}

interface SecurityEventParams {
  userId?: string;
  eventType: string;
  severity: "low" | "medium" | "high" | "critical";
  description: string;
  metadata?: Record<string, any>;
  blocked?: boolean;
  notified?: boolean;
}

/**
 * Log a security event
 */
export async function logSecurityEvent(params: SecurityEventParams) {
  try {
    const headersList = await headers();
    const ipAddress =
      headersList.get("x-forwarded-for") ||
      headersList.get("x-real-ip") ||
      "unknown";
    const userAgent = headersList.get("user-agent") || undefined;

    await prisma.securityEvent.create({
      data: {
        userId: params.userId,
        eventType: params.eventType,
        severity: params.severity,
        description: params.description,
        metadata: params.metadata,
        blocked: params.blocked || false,
        notified: params.notified || false,
        ipAddress,
        userAgent,
      },
    });
  } catch (error) {
    console.error("Failed to log security event:", error);
  }
}

/**
 * Detect suspicious activity patterns
 */
export async function detectSuspiciousActivity(
  userId: string
): Promise<boolean> {
  const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);

  // Check for multiple failed login attempts
  const failedLogins = await prisma.securityEvent.count({
    where: {
      userId,
      eventType: "failed_login",
      createdAt: {
        gte: last24Hours,
      },
    },
  });

  if (failedLogins >= 5) {
    await logSecurityEvent({
      userId,
      eventType: "suspicious_activity",
      severity: "high",
      description: `Multiple failed login attempts detected: ${failedLogins} in 24 hours`,
      metadata: { failedLogins },
    });
    return true;
  }

  // Check for unusual deposit amounts
  const largeDeposits = await prisma.transaction.count({
    where: {
      userId,
      type: "DEPOSIT",
      amount: {
        gte: 1000000, // 1 million naira
      },
      createdAt: {
        gte: last24Hours,
      },
    },
  });

  if (largeDeposits >= 3) {
    await logSecurityEvent({
      userId,
      eventType: "unusual_deposit",
      severity: "medium",
      description: `Multiple large deposits detected: ${largeDeposits} in 24 hours`,
      metadata: { largeDeposits },
    });
    return true;
  }

  return false;
}

/**
 * Check if IP is blocked
 */
export async function isIpBlocked(ipAddress: string): Promise<boolean> {
  const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const blockedEvents = await prisma.securityEvent.count({
    where: {
      ipAddress,
      blocked: true,
      createdAt: {
        gte: last24Hours,
      },
    },
  });

  return blockedEvents >= 10; // Block after 10 blocked events in 24 hours
}

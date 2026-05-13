import { prisma } from "@chowvest/database";
import { headers } from "next/headers";

interface AuditLogParams {
  userId?: string;
  action: string;
  category: "auth" | "financial" | "profile" | "security";
  severity?: "info" | "warning" | "critical";
  description: string;
  metadata?: Record<string, any>;
  oldValue?: Record<string, any>;
  newValue?: Record<string, any>;
  success?: boolean;
  errorMessage?: string;
  endpoint?: string;
  method?: string;
}

/**
 * Create an audit log entry
 */
export async function logAction(params: AuditLogParams) {
  try {
    const headersList = await headers();
    const ipAddress =
      headersList.get("x-forwarded-for") ||
      headersList.get("x-real-ip") ||
      "unknown";
    const userAgent = headersList.get("user-agent") || undefined;

    await prisma.auditLog.create({
      data: {
        userId: params.userId,
        action: params.action,
        category: params.category,
        severity: params.severity || "info",
        description: params.description,
        metadata: params.metadata,
        oldValue: params.oldValue,
        newValue: params.newValue,
        success: params.success ?? true,
        errorMessage: params.errorMessage,
        endpoint: params.endpoint,
        method: params.method,
        ipAddress,
        userAgent,
      },
    });
  } catch (error) {
    // Don't throw - audit logging should never break the main flow
    console.error("Failed to create audit log:", error);
  }
}

/**
 * Log financial actions (deposits, withdrawals, transfers)
 */
export async function logFinancialAction(
  userId: string,
  action: string,
  description: string,
  metadata?: Record<string, any>
) {
  return logAction({
    userId,
    action,
    category: "financial",
    severity: "info",
    description,
    metadata,
  });
}

/**
 * Log security events
 */
export async function logSecurityEvent(
  userId: string | undefined,
  action: string,
  description: string,
  severity: "info" | "warning" | "critical" = "warning",
  metadata?: Record<string, any>
) {
  return logAction({
    userId,
    action,
    category: "security",
    severity,
    description,
    metadata,
  });
}

/**
 * Log authentication events
 */
export async function logAuthAction(
  userId: string | undefined,
  action: string,
  description: string,
  success: boolean = true,
  errorMessage?: string
) {
  return logAction({
    userId,
    action,
    category: "auth",
    severity: success ? "info" : "warning",
    description,
    success,
    errorMessage,
  });
}

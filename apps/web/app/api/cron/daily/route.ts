import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { prisma } from "@chowvest/database";
import {
  sendGoalReminderNotification,
  sendGoalPausedNotification,
  sendGoalPriceChangeNotification,
  sendTransactionNotification,
} from "@/lib/notifications/create";
import { verifyPayment, koboToNaira } from "@/lib/payment";
import { logFinancialAction } from "@/lib/audit";
import { Prisma } from "@chowvest/database";

export const dynamic = "force-dynamic";

const REMINDER_DAYS = [30, 15, 7, 4, 1];

// ─── Task 1: Clean up stale pending transactions ──────────────────────────────
async function runTransactionCleanup() {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const pendingTransactions = await prisma.transaction.findMany({
    where: {
      status: "PENDING",
      createdAt: { lt: oneHourAgo },
      processorTransactionId: { not: null },
    },
    take: 50,
    include: { wallet: true },
  });

  let success = 0, failed = 0;

  for (const transaction of pendingTransactions) {
    if (!transaction.processorTransactionId) continue;
    try {
      const verification = await verifyPayment(transaction.processorTransactionId);
      const gatewayStatus = verification.data.status;

      if (gatewayStatus === "success") {
        const amount = koboToNaira(verification.data.amount);
        const fee = koboToNaira(verification.data.fees ?? 0);
        const netAmount = amount - fee;

        await prisma.$transaction(async (tx) => {
          const updatedWallet = await tx.wallet.update({
            where: { id: transaction.walletId },
            data: {
              balance: { increment: new Prisma.Decimal(netAmount) },
              totalDeposits: { increment: new Prisma.Decimal(amount) },
            },
          });
          await tx.transaction.update({
            where: { id: transaction.id },
            data: {
              status: "COMPLETED",
              amount: new Prisma.Decimal(amount),
              fee: new Prisma.Decimal(fee),
              netAmount: new Prisma.Decimal(netAmount),
              balanceAfter: updatedWallet.balance,
              completedAt: new Date(),
              processorFee: new Prisma.Decimal(fee),
              processorResponse: verification.data as any,
            },
          });
        });

        await logFinancialAction(transaction.userId, "deposit_completed",
          `Deposit of ₦${amount.toFixed(2)} completed via daily cron`,
          { amount: amount.toString(), reference: transaction.processorTransactionId, source: "cron" }
        );
        await sendTransactionNotification(transaction.userId, "DEPOSIT", netAmount, "COMPLETED");
        success++;
      } else if (gatewayStatus === "failed" || gatewayStatus === "abandoned") {
        await prisma.transaction.update({
          where: { id: transaction.id },
          data: { status: "FAILED", failureReason: verification.data.gateway_response || `Payment ${gatewayStatus}` },
        });
        failed++;
      }
    } catch (error: any) {
      const msg = error.message?.toLowerCase() || "";
      if (msg.includes("not found")) {
        await prisma.transaction.update({
          where: { id: transaction.id },
          data: { status: "CANCELLED", failureReason: "Abandoned checkout (Transaction not found on provider)" },
        });
        failed++;
      }
    }
  }

  return { total: pendingTransactions.length, success, failed };
}

// ─── Task 2: Send deadline reminders for active goals ────────────────────────
async function runGoalReminders() {
  const now = new Date();
  let sent = 0;

  for (const days of REMINDER_DAYS) {
    const windowStart = new Date(now);
    windowStart.setDate(windowStart.getDate() + days);
    windowStart.setHours(0, 0, 0, 0);
    const windowEnd = new Date(windowStart);
    windowEnd.setHours(23, 59, 59, 999);

    const reminderKey = `${days}d`;

    const baskets = await prisma.basket.findMany({
      where: {
        status: "ACTIVE",
        targetDate: { gte: windowStart, lte: windowEnd },
        NOT: { remindersSent: { has: reminderKey } },
      },
      select: { id: true, userId: true, name: true },
    });

    for (const basket of baskets) {
      await sendGoalReminderNotification(basket.userId, basket.name, days);
      await prisma.basket.update({
        where: { id: basket.id },
        data: { remindersSent: { push: reminderKey } },
      });
      sent++;
    }
  }

  return { sent };
}

// ─── Task 3: Pause goals whose target date has passed ────────────────────────
async function runPauseExpiredGoals() {
  const now = new Date();

  const overdue = await prisma.basket.findMany({
    where: { status: "ACTIVE", targetDate: { lt: now } },
    select: { id: true, userId: true, name: true, currentAmount: true, goalAmount: true },
    take: 100,
  });

  const toExpire = overdue.filter(
    (b) => Number(b.currentAmount) < Number(b.goalAmount)
  );

  for (const basket of toExpire) {
    await prisma.basket.update({
      where: { id: basket.id },
      data: { status: "PAUSED", pausedAt: now },
    });
    await sendGoalPausedNotification(basket.userId, basket.name);
  }

  return { paused: toExpire.length };
}

// ─── Task 4: Notify users of commodity price changes on active goals ──────────
async function runCheckPriceChanges() {
  const baskets = await prisma.basket.findMany({
    where: { status: "ACTIVE", commodityId: { not: null } },
    select: {
      id: true,
      userId: true,
      name: true,
      lockedPrice: true,
      remindersSent: true,
      commodity: { select: { price: true } },
    },
    take: 200,
  });

  let notified = 0;

  for (const basket of baskets) {
    if (!basket.commodity) continue;
    const lockedPrice = Number(basket.lockedPrice);
    const currentPrice = Number(basket.commodity.price);
    const priceKey = `PRICE_CHANGE_${currentPrice}`;
    if (currentPrice !== lockedPrice && !basket.remindersSent.includes(priceKey)) {
      await sendGoalPriceChangeNotification(basket.userId, basket.name, lockedPrice, currentPrice);
      
      await prisma.basket.update({
        where: { id: basket.id },
        data: { remindersSent: { push: priceKey } },
      });
      
      notified++;
    }
  }

  return { notified };
}

// ─── Master handler ───────────────────────────────────────────────────────────
export async function GET(_req: NextRequest) {
  try {
    const headersList = await headers();
    const authHeader = headersList.get("authorization");

    if (
      process.env.CRON_SECRET &&
      authHeader !== `Bearer ${process.env.CRON_SECRET}`
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [transactions, reminders, paused, priceChanges] = await Promise.all([
      runTransactionCleanup(),
      runGoalReminders(),
      runPauseExpiredGoals(),
      runCheckPriceChanges(),
    ]);

    return NextResponse.json({
      success: true,
      runAt: new Date().toISOString(),
      transactions,
      reminders,
      paused,
      priceChanges,
    });
  } catch (error: any) {
    console.error("Daily cron error:", error);
    return NextResponse.json({ error: "Daily cron failed" }, { status: 500 });
  }
}

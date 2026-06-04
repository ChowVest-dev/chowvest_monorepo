import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { prisma } from "@chowvest/database";
import { sendGoalPausedNotification } from "@/lib/notifications/create";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const headersList = await headers();
    const authHeader = headersList.get("authorization");

    if (
      process.env.CRON_SECRET &&
      authHeader !== `Bearer ${process.env.CRON_SECRET}`
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();

    // Find all ACTIVE goals whose target date has passed and are not yet fully saved
    const expiredBaskets = await prisma.basket.findMany({
      where: {
        status: "ACTIVE",
        targetDate: { lt: now },
        // currentAmount < goalAmount — Prisma doesn't support column comparisons directly
        // so we filter in JS below after fetching
      },
      select: {
        id: true,
        userId: true,
        name: true,
        currentAmount: true,
        goalAmount: true,
      },
      take: 100,
    });

    const toExpire = expiredBaskets.filter(
      (b) => Number(b.currentAmount) < Number(b.goalAmount)
    );

    let pausedCount = 0;

    for (const basket of toExpire) {
      await prisma.basket.update({
        where: { id: basket.id },
        data: {
          status: "PAUSED",
          pausedAt: now,
        },
      });

      await sendGoalPausedNotification(basket.userId, basket.name);
      pausedCount++;
    }

    return NextResponse.json({
      success: true,
      runAt: now.toISOString(),
      pausedCount,
    });
  } catch (error: any) {
    console.error("Pause expired goals cron error:", error);
    return NextResponse.json({ error: "Failed to pause expired goals" }, { status: 500 });
  }
}

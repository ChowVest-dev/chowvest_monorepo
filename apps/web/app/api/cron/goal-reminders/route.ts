import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { prisma } from "@chowvest/database";
import { sendGoalReminderNotification } from "@/lib/notifications/create";

export const dynamic = "force-dynamic";

const REMINDER_DAYS = [30, 15, 7, 4, 1];

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
    let notificationsSent = 0;

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
          // Only send if this reminder hasn't been sent yet
          NOT: { remindersSent: { has: reminderKey } },
        },
        select: {
          id: true,
          userId: true,
          name: true,
          remindersSent: true,
        },
      });

      for (const basket of baskets) {
        await sendGoalReminderNotification(basket.userId, basket.name, days);
        await prisma.basket.update({
          where: { id: basket.id },
          data: { remindersSent: { push: reminderKey } },
        });
        notificationsSent++;
      }
    }

    return NextResponse.json({
      success: true,
      runAt: now.toISOString(),
      notificationsSent,
    });
  } catch (error: any) {
    console.error("Goal reminders cron error:", error);
    return NextResponse.json({ error: "Failed to send goal reminders" }, { status: 500 });
  }
}

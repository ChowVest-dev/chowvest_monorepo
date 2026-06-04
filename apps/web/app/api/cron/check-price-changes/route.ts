import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { prisma } from "@chowvest/database";
import { sendGoalPriceChangeNotification } from "@/lib/notifications/create";

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

    // Find all ACTIVE baskets that have a commodity linked
    const baskets = await prisma.basket.findMany({
      where: {
        status: "ACTIVE",
        commodityId: { not: null },
      },
      select: {
        id: true,
        userId: true,
        name: true,
        lockedPrice: true,
        remindersSent: true,
        commodity: {
          select: { price: true },
        },
      },
      take: 200,
    });

    let notificationssent = 0;

    for (const basket of baskets) {
      if (!basket.commodity) continue;

      const lockedPrice = Number(basket.lockedPrice);
      const currentPrice = Number(basket.commodity.price);

      const priceKey = `PRICE_CHANGE_${currentPrice}`;
      if (currentPrice !== lockedPrice && !basket.remindersSent.includes(priceKey)) {
        await sendGoalPriceChangeNotification(
          basket.userId,
          basket.name,
          lockedPrice,
          currentPrice
        );
        
        // Track that we notified them about THIS specific price so we don't spam them tomorrow
        await prisma.basket.update({
          where: { id: basket.id },
          data: { remindersSent: { push: priceKey } },
        });
        
        notificationssent++;
      }
    }

    return NextResponse.json({
      success: true,
      runAt: new Date().toISOString(),
      notificationssent,
    });
  } catch (error: any) {
    console.error("Check price changes cron error:", error);
    return NextResponse.json({ error: "Failed to check price changes" }, { status: 500 });
  }
}

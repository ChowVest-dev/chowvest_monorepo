import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@chowvest/database";
import { logFinancialAction } from "@/lib/audit";
import { sendTransactionNotification, sendGoalCompletionNotification } from "@/lib/notifications/create";
import { Prisma } from "@chowvest/database";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    const { id: basketId } = await params;

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { targetDate } = body;

    if (!targetDate) {
      return NextResponse.json({ error: "Target date is required" }, { status: 400 });
    }

    const newTargetDate = new Date(targetDate);
    const now = new Date();
    const minDate = new Date(now);
    minDate.setDate(minDate.getDate() + 7);
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 60);

    if (newTargetDate < minDate || newTargetDate > maxDate) {
      return NextResponse.json(
        { error: "Target date must be between 7 and 60 days from today" },
        { status: 400 }
      );
    }

    const [wallet, basket] = await Promise.all([
      prisma.wallet.findUnique({ where: { userId: session.user.id } }),
      prisma.basket.findFirst({
        where: { id: basketId, userId: session.user.id },
        include: { commodity: { select: { price: true, name: true } } },
      }),
    ]);

    if (!wallet) return NextResponse.json({ error: "Wallet not found" }, { status: 404 });
    if (!basket) return NextResponse.json({ error: "Basket not found" }, { status: 404 });

    if (basket.status !== "PAUSED") {
      return NextResponse.json(
        { error: "Only paused goals can be continued" },
        { status: 400 }
      );
    }

    const currentAmount = new Prisma.Decimal(basket.currentAmount);
    const currentMarketPrice = basket.commodity
      ? new Prisma.Decimal(basket.commodity.price)
      : new Prisma.Decimal(basket.goalAmount); // Fallback to goalAmount if no commodity linked

    // Case: user has already saved enough to cover the current market price — auto-complete
    if (currentAmount.greaterThanOrEqualTo(currentMarketPrice)) {
      const excess = currentAmount.sub(currentMarketPrice);

      const result = await prisma.$transaction(async (tx) => {
        // Refund excess to wallet if any
        const updatedWallet = excess.greaterThan(0)
          ? await tx.wallet.update({
              where: { id: wallet.id },
              data: { balance: { increment: excess } },
            })
          : wallet;

        if (excess.greaterThan(0)) {
          await tx.transaction.create({
            data: {
              userId: session.user.id,
              walletId: wallet.id,
              basketId: basket.id,
              type: "REFUND",
              amount: excess,
              netAmount: excess,
              description: `Excess refund from "${basket.name}" — market price dropped to ₦${currentMarketPrice.toFixed(2)}`,
              status: "COMPLETED",
              balanceBefore: wallet.balance,
              balanceAfter: updatedWallet.balance,
              completedAt: new Date(),
            },
          });
        }

        const updatedBasket = await tx.basket.update({
          where: { id: basket.id },
          data: {
            status: "COMPLETED",
            completedAt: new Date(),
            goalAmount: currentMarketPrice,
            currentAmount: currentMarketPrice,
            pausedAt: null,
          },
        });

        return { wallet: updatedWallet, basket: updatedBasket };
      });

      if (excess.greaterThan(0)) {
        await logFinancialAction(
          session.user.id,
          "refund",
          `Excess ₦${excess.toFixed(2)} refunded from "${basket.name}" after market price drop`,
          { basketId, excess: excess.toString() }
        );
        await sendTransactionNotification(session.user.id, "REFUND", excess.toNumber(), "COMPLETED");
      }

      await sendGoalCompletionNotification(session.user.id, basket.name, currentMarketPrice.toNumber());

      return NextResponse.json({
        success: true,
        outcome: "completed",
        message: excess.greaterThan(0)
          ? `Goal completed! ₦${excess.toFixed(2)} excess refunded to your wallet.`
          : "Goal completed! You can now request delivery.",
        basket: {
          ...result.basket,
          currentAmount: result.basket.currentAmount.toString(),
          goalAmount: result.basket.goalAmount.toString(),
        },
      });
    }

    // Case: user needs to keep saving — resume at current market price with new target date
    const updatedBasket = await prisma.basket.update({
      where: { id: basket.id },
      data: {
        status: "ACTIVE",
        goalAmount: currentMarketPrice,
        targetDate: newTargetDate,
        pausedAt: null,
        remindersSent: [], // Reset reminders for new cycle
      },
    });

    await logFinancialAction(
      session.user.id,
      "goal_continued",
      `Goal "${basket.name}" continued at new market price ₦${currentMarketPrice.toFixed(2)}`,
      { basketId, newGoalAmount: currentMarketPrice.toString(), newTargetDate: newTargetDate.toISOString() }
    );

    return NextResponse.json({
      success: true,
      outcome: "resumed",
      message: "Goal resumed. Keep saving!",
      basket: {
        ...updatedBasket,
        currentAmount: updatedBasket.currentAmount.toString(),
        goalAmount: updatedBasket.goalAmount.toString(),
        lockedPrice: updatedBasket.lockedPrice.toString(),
      },
    });
  } catch (error: any) {
    console.error("Continue goal error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to continue goal" },
      { status: 500 }
    );
  }
}

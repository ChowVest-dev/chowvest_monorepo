import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@chowvest/database";
import { logFinancialAction } from "@/lib/audit";
import { sendTransactionNotification } from "@/lib/notifications/create";
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

    const [wallet, basket] = await Promise.all([
      prisma.wallet.findUnique({ where: { userId: session.user.id } }),
      prisma.basket.findFirst({
        where: { id: basketId, userId: session.user.id },
      }),
    ]);

    if (!wallet) return NextResponse.json({ error: "Wallet not found" }, { status: 404 });
    if (!basket) return NextResponse.json({ error: "Basket not found" }, { status: 404 });

    if (basket.status !== "PAUSED") {
      return NextResponse.json(
        { error: "Only paused goals can be expired" },
        { status: 400 }
      );
    }

    const refundAmount = new Prisma.Decimal(basket.currentAmount);
    const hasFunds = refundAmount.greaterThan(0);

    const result = await prisma.$transaction(async (tx) => {
      let updatedWallet = wallet;

      if (hasFunds) {
        updatedWallet = await tx.wallet.update({
          where: { id: wallet.id },
          data: { balance: { increment: refundAmount } },
        });

        await tx.transaction.create({
          data: {
            userId: session.user.id,
            walletId: wallet.id,
            basketId: basket.id,
            type: "TRANSFER_FROM_BASKET",
            amount: refundAmount,
            netAmount: refundAmount,
            description: `Full refund from expired goal: ${basket.name}`,
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
          status: "EXPIRED",
          currentAmount: 0,
          expiredAt: new Date(),
        },
      });

      return { wallet: updatedWallet, basket: updatedBasket };
    });

    if (hasFunds) {
      await logFinancialAction(
        session.user.id,
        "transfer_from_basket",
        `Full refund of ₦${refundAmount.toFixed(2)} from expired goal: ${basket.name}`,
        {
          amount: refundAmount.toString(),
          basketId,
          basketName: basket.name,
          newBalance: result.wallet.balance.toString(),
        }
      );

      await sendTransactionNotification(
        session.user.id,
        "TRANSFER_FROM_BASKET",
        refundAmount.toNumber(),
        "COMPLETED"
      );
    }

    return NextResponse.json({
      success: true,
      message: hasFunds
        ? `Goal closed. ₦${refundAmount.toFixed(2)} refunded to your wallet.`
        : "Goal closed.",
      basket: {
        ...result.basket,
        currentAmount: result.basket.currentAmount.toString(),
        goalAmount: result.basket.goalAmount.toString(),
      },
      wallet: {
        ...result.wallet,
        balance: result.wallet.balance.toString(),
      },
    });
  } catch (error: any) {
    console.error("Expire goal error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to expire goal" },
      { status: 500 }
    );
  }
}

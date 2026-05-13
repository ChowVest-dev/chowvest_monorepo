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

    // Get wallet and basket
    const [wallet, basket] = await Promise.all([
      prisma.wallet.findUnique({
        where: { userId: session.user.id },
      }),
      prisma.basket.findFirst({
        where: {
          id: basketId,
          userId: session.user.id,
        },
      }),
    ]);

    if (!wallet) {
      return NextResponse.json({ error: "Wallet not found" }, { status: 404 });
    }

    if (!basket) {
      return NextResponse.json({ error: "Basket not found" }, { status: 404 });
    }

    if (basket.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "Only active goals can be cancelled" },
        { status: 400 }
      );
    }

    const originalAmount = basket.currentAmount;
    const hasFunds = originalAmount.greaterThan(0);

    // Apply 5% Early Cancellation Fee
    let penaltyAmount = new Prisma.Decimal(0);
    let netRefundAmount = originalAmount;
    
    if (hasFunds) {
       penaltyAmount = originalAmount.mul(0.05);
       netRefundAmount = originalAmount.sub(penaltyAmount);
    }

    // Perform cancellation and reversal in a transaction
    const result = await prisma.$transaction(async (tx) => {
      let updatedWallet = wallet;

      if (hasFunds) {
        // Increment wallet balance with only the net amount
        updatedWallet = await tx.wallet.update({
          where: { id: wallet.id },
          data: {
            balance: {
              increment: netRefundAmount,
            },
          },
        });

        // 1. Create full refund transaction record
        const balanceAfterRefund = wallet.balance.add(originalAmount);
        await tx.transaction.create({
          data: {
            userId: session.user.id,
            walletId: wallet.id,
            basketId: basket.id,
            type: "TRANSFER_FROM_BASKET",
            amount: originalAmount,
            netAmount: originalAmount,
            description: `Refund from cancelled goal: ${basket.name}`,
            status: "COMPLETED",
            balanceBefore: wallet.balance,
            balanceAfter: balanceAfterRefund,
            completedAt: new Date(),
          },
        });

        // 2. Create the fee transaction record
        await tx.transaction.create({
          data: {
            userId: session.user.id,
            walletId: wallet.id,
            basketId: basket.id,
            type: "CANCELLATION_FEE",
            amount: penaltyAmount,
            netAmount: penaltyAmount,
            description: `Early Cancellation Fee for ${basket.name}`,
            status: "COMPLETED",
            balanceBefore: balanceAfterRefund,
            balanceAfter: updatedWallet.balance,
            completedAt: new Date(),
          },
        });
      }

      // Update basket status and set amount to 0
      const updatedBasket = await tx.basket.update({
        where: { id: basketId },
        data: {
          status: "CANCELLED",
          currentAmount: 0,
          cancelledAt: new Date(),
        },
      });

      return {
        wallet: updatedWallet,
        basket: updatedBasket,
      };
    });

    if (hasFunds) {
      // Log the financial action
      await logFinancialAction(
        session.user.id,
        "transfer_from_basket",
        `Refunded ₦${netRefundAmount.toFixed(2)} from cancelled goal: ${basket.name}`,
        {
          amount: netRefundAmount.toString(),
          basketId,
          basketName: basket.name,
          newBalance: result.wallet.balance.toString(),
        }
      );

      // Send transaction notification
      await sendTransactionNotification(
        session.user.id,
        "TRANSFER_FROM_BASKET",
        netRefundAmount.toNumber(),
        "COMPLETED"
      );
    }

    return NextResponse.json({
      success: true,
      message: hasFunds
        ? "Goal cancelled and funds refunded to wallet"
        : "Goal cancelled successfully",
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
    console.error("Cancel goal error:", error);
   // console.log("Cancel goal error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to cancel goal" },
      { status: 500 }
    );
  }
}

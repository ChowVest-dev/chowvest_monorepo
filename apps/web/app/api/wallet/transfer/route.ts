import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@chowvest/database";
import { logFinancialAction } from "@/lib/audit";
import { logSecurityEvent } from "@/lib/security";
import { sendTransactionNotification } from "@/lib/notifications/create";
import { Prisma } from "@chowvest/database";

const MAX_TRANSFER_AMOUNT = 1_000_000; // ₦1,000,000 hard cap

export async function POST(req: NextRequest) {
  try {
    // ─── Feature Kill Switch ───
    const { getFeatureFlags } = await import("@/lib/feature-flags");
    if (!getFeatureFlags().withdrawals) {
      return NextResponse.json(
        { error: "Transfers are temporarily unavailable. Please try again later." },
        { status: 503 }
      );
    }

    const session = await getSession();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { basketId, amount } = body;

    if (!basketId || !amount || amount <= 0) {
      return NextResponse.json(
        { error: "Invalid basket ID or amount" },
        { status: 400 }
      );
    }

    // Hard cap: transfers above ₦1,000,000 are blocked and flagged
    if (amount > MAX_TRANSFER_AMOUNT) {
      await logSecurityEvent({
        userId: session.user.id,
        eventType: "large_transfer_attempt",
        severity: "critical",
        description: `Transfer of ₦${amount.toLocaleString()} exceeds the ₦1,000,000 maximum limit`,
        metadata: {
          attemptedAmount: amount,
          basketId,
          limit: MAX_TRANSFER_AMOUNT,
        },
        blocked: true,
      });

      return NextResponse.json(
        { error: `Transfer amount cannot exceed ₦${MAX_TRANSFER_AMOUNT.toLocaleString()}` },
        { status: 400 }
      );
    }

    // Get wallet and basket
    const [wallet, basket] = await Promise.all([
      prisma.wallet.findUnique({
        where: { userId: session.user.id },
      }),
      prisma.basket.findFirst({
        where: { id: basketId, userId: session.user.id },
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
        { error: "Basket is not active" },
        { status: 400 }
      );
    }

    // Convert amount to Decimal for comparison
    const amountDecimal = new Prisma.Decimal(amount);

    if (wallet.balance.lessThan(amountDecimal)) {
      return NextResponse.json(
        { error: "Insufficient wallet balance" },
        { status: 400 }
      );
    }

    // Perform transfer in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update wallet
      const updatedWallet = await tx.wallet.update({
        where: { id: wallet.id },
        data: {
          balance: {
            decrement: amountDecimal,
          },
        },
      });

      // Update basket
      const newBasketAmount = basket.currentAmount.add(amountDecimal);
      const isCompleted = newBasketAmount.greaterThanOrEqualTo(
        basket.goalAmount
      );

      const updatedBasket = await tx.basket.update({
        where: { id: basketId },
        data: {
          currentAmount: {
            increment: amountDecimal,
          },
          status: isCompleted ? "COMPLETED" : basket.status,
          completedAt: isCompleted ? new Date() : basket.completedAt,
        },
      });

      // Create transaction record
      const transaction = await tx.transaction.create({
        data: {
          userId: session.user.id,
          walletId: wallet.id,
          basketId: basket.id,
          type: "TRANSFER_TO_BASKET",
          amount: amountDecimal,
          netAmount: amountDecimal,
          description: `Transfer to ${basket.name}`,
          status: "COMPLETED",
          balanceBefore: wallet.balance,
          balanceAfter: updatedWallet.balance,
          completedAt: new Date(),
        },
      });

      return {
        wallet: updatedWallet,
        basket: updatedBasket,
        transaction,
        isCompleted,
      };
    });

    // Log the transfer
    await logFinancialAction(
      session.user.id,
      "transfer_to_basket",
      `Transferred ₦${amountDecimal.toFixed(2)}`,
      {
        amount: amountDecimal.toString(),
        basketId,
        basketName: basket.name,
        newBalance: result.wallet.balance.toString(),
        newBasketAmount: result.basket.currentAmount.toString(),
      }
    );

    // Send notification
    await sendTransactionNotification(
      session.user.id,
      "TRANSFER_TO_BASKET",
      amountDecimal.toNumber(),
      "COMPLETED"
    );

    // Check for milestones
    const progress = result.basket.currentAmount
      .dividedBy(result.basket.goalAmount)
      .times(100)
      .toNumber();

    const previousProgress = basket.currentAmount
      .dividedBy(basket.goalAmount)
      .times(100)
      .toNumber();

    const milestones = [25, 50, 75, 100];

    for (const milestone of milestones) {
      if (progress >= milestone && previousProgress < milestone) {
        if (milestone === 100) {
          const { sendGoalCompletionNotification } = await import(
            "@/lib/notifications/create"
          );
          await sendGoalCompletionNotification(
            session.user.id,
            basket.name,
            result.basket.goalAmount.toNumber()
          );
        } else {
          const { sendMilestoneNotification } = await import(
            "@/lib/notifications/create"
          );
          await sendMilestoneNotification(
            session.user.id,
            basket.name,
            progress,
            milestone
          );
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: "Transfer completed successfully",
      wallet: {
        ...result.wallet,
        balance: result.wallet.balance.toString(), // Convert to string for JSON
      },
      basket: {
        ...result.basket,
        currentAmount: result.basket.currentAmount.toString(),
        goalAmount: result.basket.goalAmount.toString(),
      },
      transaction: {
        ...result.transaction,
        amount: result.transaction.amount.toString(),
        netAmount: result.transaction.netAmount.toString(),
        balanceBefore: result.transaction.balanceBefore.toString(),
        balanceAfter: result.transaction.balanceAfter.toString(),
      },
    });
  } catch (error: any) {
    console.error("Transfer error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to transfer funds" },
      { status: 500 }
    );
  }
}

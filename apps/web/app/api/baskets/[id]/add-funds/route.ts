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

    // Await params in Next.js 15+
    const { id: basketId } = await params;

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { amount } = body;

    if (!amount || amount < 500) {
      return NextResponse.json({ error: "Minimum deposit amount is ₦500" }, { status: 400 });
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
        { error: "Basket is not active" },
        { status: 400 }
      );
    }

    // Convert amount to Decimal for comparison
    const amountDecimal = new Prisma.Decimal(amount);
    const remainingAmount = basket.goalAmount.minus(basket.currentAmount);

    if (amountDecimal.greaterThan(remainingAmount)) {
      return NextResponse.json(
        { error: `Maximum allowed for this goal is ₦${remainingAmount.toNumber().toLocaleString()}` },
        { status: 400 }
      );
    }

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
      `Transferred ₦${amountDecimal.toFixed(2)} to ${basket.name}`,
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
      message: "Funds added successfully",
      wallet: {
        ...result.wallet,
        balance: result.wallet.balance.toString(),
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
    console.error("Add funds error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to add funds" },
      { status: 500 }
    );
  }
}

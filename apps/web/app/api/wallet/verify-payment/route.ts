import { NextRequest, NextResponse } from "next/server";
import { verifyPayment, koboToNaira } from "@/lib/payment";
import { prisma } from "@chowvest/database";
import { logFinancialAction } from "@/lib/audit";
import { sendTransactionNotification } from "@/lib/notifications/create";
import { Prisma } from "@chowvest/database";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { reference } = body;

    if (!reference) {
      return NextResponse.json(
        { error: "Payment reference is required" },
        { status: 400 }
      );
    }

    // Verify payment with Paystack
    const paymentData = await verifyPayment(reference);

    if (!paymentData.status || paymentData.data.status !== "success") {
      return NextResponse.json(
        { error: "Payment verification failed" },
        { status: 400 }
      );
    }

    // Find the transaction
    const transaction = await prisma.transaction.findUnique({
      where: { processorTransactionId: reference },
      include: { wallet: true },
    });

    if (!transaction) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      );
    }

    // Check if already processed
    if (transaction.status === "COMPLETED") {
      return NextResponse.json({
        success: true,
        message: "Payment already processed",
        transaction: {
          ...transaction,
          amount: transaction.amount.toString(),
          fee: transaction.fee?.toString(),
          netAmount: transaction.netAmount.toString(),
          balanceBefore: transaction.balanceBefore.toString(),
          balanceAfter: transaction.balanceAfter.toString(),
        },
      });
    }

    const amount = koboToNaira(paymentData.data.amount);
    const fee = koboToNaira(paymentData.data.fees || 0);
    const netAmount = amount - fee;

    // Convert to Decimal
    const amountDecimal = new Prisma.Decimal(amount);
    const feeDecimal = new Prisma.Decimal(fee);
    const netAmountDecimal = new Prisma.Decimal(netAmount);

    // Update transaction and wallet in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update wallet balance
      const updatedWallet = await tx.wallet.update({
        where: { id: transaction.walletId },
        data: {
          balance: {
            increment: netAmountDecimal,
          },
          totalDeposits: {
            increment: amountDecimal,
          },
        },
      });

      // Update transaction
      const updatedTransaction = await tx.transaction.update({
        where: { id: transaction.id },
        data: {
          status: "COMPLETED",
          amount: amountDecimal,
          fee: feeDecimal,
          netAmount: netAmountDecimal,
          balanceAfter: updatedWallet.balance,
          completedAt: new Date(),
          processorFee: feeDecimal,
          processorResponse: paymentData.data as any,
        },
      });

      return { wallet: updatedWallet, transaction: updatedTransaction };
    });

    // Log the successful deposit
    await logFinancialAction(
      transaction.userId,
      "deposit_completed",
      `Deposit of ₦${amountDecimal.toFixed(2)} completed successfully`,
      {
        amount: amountDecimal.toString(),
        fee: feeDecimal.toString(),
        netAmount: netAmountDecimal.toString(),
        reference,
        newBalance: result.wallet.balance.toString(),
      }
    );

    // Send notification
    await sendTransactionNotification(
      transaction.userId,
      "DEPOSIT",
      netAmountDecimal.toNumber(),
      "COMPLETED"
    );

    return NextResponse.json({
      success: true,
      message: "Payment verified successfully",
      transaction: {
        ...result.transaction,
        amount: result.transaction.amount.toString(),
        fee: result.transaction.fee?.toString(),
        netAmount: result.transaction.netAmount.toString(),
        balanceBefore: result.transaction.balanceBefore.toString(),
        balanceAfter: result.transaction.balanceAfter.toString(),
        processorFee: result.transaction.processorFee?.toString(),
      },
      wallet: {
        ...result.wallet,
        balance: result.wallet.balance.toString(),
        totalDeposits: result.wallet.totalDeposits.toString(),
        totalSpent: result.wallet.totalSpent.toString(),
        pendingDeposits: result.wallet.pendingDeposits.toString(),
      },
    });
  } catch (error: any) {
    console.error("Payment verification error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to verify payment" },
      { status: 500 }
    );
  }
}

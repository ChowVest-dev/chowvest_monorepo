import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { prisma } from "@chowvest/database";
import { verifyPayment, koboToNaira } from "@/lib/payment";
import { Prisma } from "@chowvest/database";
import { logFinancialAction } from "@/lib/audit";
import { sendTransactionNotification } from "@/lib/notifications/create";

// Ensure this route is not cached
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const headersList = await headers();
    const authHeader = headersList.get("authorization");

    // Secure the cron endpoint
    if (
      process.env.CRON_SECRET &&
      authHeader !== `Bearer ${process.env.CRON_SECRET}`
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1 hour ago
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    // Fetch up to 50 pending transactions older than 1 hour to prevent hitting execution limits
    const pendingTransactions = await prisma.transaction.findMany({
      where: {
        status: "PENDING",
        createdAt: {
          lt: oneHourAgo,
        },
        processorTransactionId: {
          not: null,
        },
      },
      take: 50,
      include: {
        wallet: true,
      },
    });

    let processedCount = 0;
    let failedCount = 0;
    let successCount = 0;

    for (const transaction of pendingTransactions) {
      if (!transaction.processorTransactionId) continue;

      try {
        const verification = await verifyPayment(transaction.processorTransactionId);

        // Paystack states: "success", "abandoned", "failed", "ongoing", "pending"
        const gatewayStatus = verification.data.status;

        if (gatewayStatus === "success") {
          // It succeeded but we missed the webhook
          const amountKobo = verification.data.amount;
          const fees = verification.data.fees;

          const amount = koboToNaira(amountKobo);
          const fee = koboToNaira(fees ?? 0);
          const netAmount = amount - fee;

          const amountDecimal = new Prisma.Decimal(amount);
          const feeDecimal = new Prisma.Decimal(fee);
          const netAmountDecimal = new Prisma.Decimal(netAmount);

          const result = await prisma.$transaction(async (tx) => {
            const updatedWallet = await tx.wallet.update({
              where: { id: transaction.walletId },
              data: {
                balance: { increment: netAmountDecimal },
                totalDeposits: { increment: amountDecimal },
              },
            });

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
                processorResponse: verification.data as any,
              },
            });

            return { wallet: updatedWallet, transaction: updatedTransaction };
          });

          await logFinancialAction(
            transaction.userId,
            "deposit_completed",
            `Deposit of ₦${amountDecimal.toFixed(2)} completed via Cron Sweep`,
            {
              amount: amountDecimal.toString(),
              reference: transaction.processorTransactionId,
              source: "cron",
            }
          );

          await sendTransactionNotification(
            transaction.userId,
            "DEPOSIT",
            netAmountDecimal.toNumber(),
            "COMPLETED"
          );

          successCount++;
        } else if (gatewayStatus === "failed" || gatewayStatus === "abandoned") {
          // Mark as failed locally
          const gatewayResponse = verification.data.gateway_response || `Payment ${gatewayStatus}`;

          await prisma.transaction.update({
            where: { id: transaction.id },
            data: {
              status: "FAILED",
              failureReason: gatewayResponse,
              updatedAt: new Date(),
            },
          });

          failedCount++;
        }
        // If it's still 'ongoing' or 'pending', we leave it alone.
        
        processedCount++;
      } catch (error: any) {
        // If we get a 400 transaction not found from Paystack, it means the reference was generated
        // but the user never even opened the Paystack popup. We should fail it.
        const errorMessage = error.message?.toLowerCase() || "";
        if (errorMessage.includes("not found")) {
          await prisma.transaction.update({
            where: { id: transaction.id },
            data: {
              status: "CANCELLED", // Or FAILED
              failureReason: "Abandoned checkout (Transaction not found on provider)",
              updatedAt: new Date(),
            },
          });
          failedCount++;
          processedCount++;
        } else {
          console.error(`Error verifying transaction ${transaction.id}:`, error);
        }
      }
    }

    return NextResponse.json({
      success: true,
      runAt: new Date().toISOString(),
      stats: {
        totalFound: pendingTransactions.length,
        processed: processedCount,
        markedSuccess: successCount,
        markedFailedOrAbandoned: failedCount,
      },
    });
  } catch (error: any) {
    console.error("Cron Sweep Error:", error);
    return NextResponse.json(
      { error: "Failed to run transaction sweep" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import crypto from "crypto";
import { koboToNaira } from "@/lib/payment";
import { prisma } from "@chowvest/database";
import { logFinancialAction } from "@/lib/audit";
import { sendTransactionNotification } from "@/lib/notifications/create";
import { Prisma } from "@chowvest/database";

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY!;

/**
 * Verify that the webhook actually came from Paystack by validating
 * the x-paystack-signature header against the request body.
 */
function verifyWebhookSignature(body: string, signature: string): boolean {
  const hash = crypto
    .createHmac("sha512", PAYSTACK_SECRET_KEY)
    .update(body)
    .digest("hex");
  return hash === signature;
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const headersList = await headers();
    const signature = headersList.get("x-paystack-signature") ?? "";

    // Always verify the signature first
    if (!verifyWebhookSignature(rawBody, signature)) {
      console.warn("Paystack webhook: invalid signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const event = JSON.parse(rawBody);

    // We care about successful and failed charges
    if (event.event !== "charge.success" && event.event !== "charge.failed") {
      return NextResponse.json({ received: true });
    }

    const eventId = event.data?.id?.toString();
    const { reference, amount: amountKobo, fees } = event.data;

    if (!reference) {
      return NextResponse.json({ error: "No reference" }, { status: 400 });
    }

    // ── Idempotency Guard ──
    // Use a DB unique constraint on eventId to prevent duplicate processing.
    // If two identical webhooks arrive simultaneously, only one will succeed
    // at inserting into ProcessedWebhook; the other will hit the unique
    // constraint and be safely rejected.
    if (eventId) {
      try {
        await prisma.processedWebhook.create({
          data: {
            eventId,
            eventType: event.event,
            reference,
            payload: event.data,
          },
        });
      } catch (error: any) {
        // P2002 = Unique constraint violation → already processed
        if (error?.code === "P2002") {
          console.log(`Paystack webhook: duplicate event ${eventId}, skipping`);
          return NextResponse.json({ received: true, message: "Already processed" });
        }
        throw error;
      }
    }

    // Find the corresponding pending transaction
    const transaction = await prisma.transaction.findUnique({
      where: { processorTransactionId: reference },
      include: { wallet: true },
    });

    if (!transaction) {
      // Transaction not found – could be a different reference format, ignore
      console.warn(`Paystack webhook: transaction not found for ref ${reference}`);
      // Return 200 so Paystack doesn't retry indefinitely
      return NextResponse.json({ received: true });
    }

    // Secondary check: skip if already processed (belt-and-suspenders)
    if (transaction.status !== "PENDING" && transaction.status !== "PROCESSING") {
      return NextResponse.json({ received: true, message: `Already processed (${transaction.status})` });
    }

    // Handle failed payments immediately
    if (event.event === "charge.failed") {
      const gatewayResponse = event.data?.gateway_response || "Payment failed at Paystack";
      
      await prisma.transaction.update({
        where: { id: transaction.id },
        data: {
          status: "FAILED",
          failureReason: gatewayResponse,
          updatedAt: new Date(),
        },
      });

      await logFinancialAction(
        transaction.userId,
        "deposit_failed",
        `Deposit of ₦${transaction.amount.toString()} failed via Paystack webhook`,
        {
          amount: transaction.amount.toString(),
          reference,
          reason: gatewayResponse,
          source: "webhook",
        }
      );

      console.log(`Paystack webhook: marked ref ${reference} as FAILED`);
      return NextResponse.json({ received: true });
    }

    const actualPaystackFee = koboToNaira(fees ?? 0);
    const totalAmountCharged = koboToNaira(amountKobo);
    const amountToCredit = transaction.netAmount; // This is the base amount

    // Calculate variance
    const metadata = (transaction.metadata as any) || {};
    const expectedPlatformFee = metadata.expectedPlatformFee || 0;
    
    // actualPlatformFee = amount we got from Paystack - amount we credit to user
    const amountRemitted = totalAmountCharged - actualPaystackFee;
    const actualPlatformFee = amountRemitted - amountToCredit.toNumber();
    const variance = actualPlatformFee - expectedPlatformFee;
    
    // Append tracking to metadata
    const updatedMetadata = {
      ...metadata,
      actualPlatformFee,
      variance,
      paystackFee: actualPaystackFee,
    };

    // Credit the wallet atomically
    const result = await prisma.$transaction(async (tx) => {
      const updatedWallet = await tx.wallet.update({
        where: { id: transaction.walletId },
        data: {
          balance: { increment: amountToCredit },
          totalDeposits: { increment: amountToCredit },
        },
      });

      const updatedTransaction = await tx.transaction.update({
        where: { id: transaction.id },
        data: {
          status: "COMPLETED",
          // We intentionally do not overwrite amount, fee, and netAmount. They correctly reflect what was promised.
          balanceAfter: updatedWallet.balance,
          completedAt: new Date(),
          processorFee: new Prisma.Decimal(actualPaystackFee),
          processorResponse: event.data,
          metadata: updatedMetadata,
        },
      });

      return { wallet: updatedWallet, transaction: updatedTransaction };
    });

    await logFinancialAction(
      transaction.userId,
      "deposit_completed",
      `Deposit of ₦${amountToCredit.toFixed(2)} completed via Paystack webhook`,
      {
        baseAmount: amountToCredit.toString(),
        totalCharged: totalAmountCharged.toString(),
        paystackFee: actualPaystackFee.toString(),
        platformFeeReceived: actualPlatformFee.toString(),
        expectedPlatformFee: expectedPlatformFee.toString(),
        variance: variance.toString(),
        reference,
        newBalance: result.wallet.balance.toString(),
        source: "webhook",
      }
    );

    await sendTransactionNotification(
      transaction.userId,
      "DEPOSIT",
      amountToCredit.toNumber(),
      "COMPLETED"
    );

    console.log(`Paystack webhook: credited ₦${amountToCredit.toString()} to wallet ${transaction.walletId} (Variance: ₦${variance.toFixed(2)})`);
    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("Paystack webhook error:", error);
    // Return 200 to prevent Paystack from retrying on our internal errors
    return NextResponse.json({ received: true });
  }
}

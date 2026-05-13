import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@chowvest/database";
import {
  initializePayment,
  generatePaymentReference,
  nairaToKobo,
} from "@/lib/payment";
import { logFinancialAction } from "@/lib/audit";
import { checkRateLimit } from "@/lib/security";
import { Prisma } from "@chowvest/database";

export async function POST(req: NextRequest) {
  try {
    // ─── Feature Kill Switch ───
    const { getFeatureFlags } = await import("@/lib/feature-flags");
    if (!getFeatureFlags().deposits) {
      return NextResponse.json(
        { error: "Deposits are temporarily unavailable. Please try again later." },
        { status: 503 }
      );
    }

    const session = await getSession();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Rate limiting: max 10 deposit attempts per hour
    const rateLimited = await checkRateLimit({
      identifier: session.user.id,
      action: "deposit",
      maxAttempts: 10,
      windowMinutes: 60,
    });

    if (rateLimited) {
      return NextResponse.json(
        { error: "Too many deposit attempts. Please try again later." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { amount, method } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    // Validate payment method
    if (!method || !["CARD", "BANK_TRANSFER"].includes(method)) {
      return NextResponse.json(
        { error: "Invalid payment method" },
        { status: 400 }
      );
    }

    // Calculate fees
    const baseAmount = amount;
    const serviceFee = 0;
    
    const flatFee = baseAmount < 2500 ? 0 : 100;
    const totalAmount = (baseAmount + flatFee) / 0.985;
    const processingFee = totalAmount - baseAmount;

    // Convert amounts to Decimal
    const totalAmountDecimal = new Prisma.Decimal(totalAmount);
    const baseAmountDecimal = new Prisma.Decimal(baseAmount);
    const totalFeeDecimal = new Prisma.Decimal(serviceFee + processingFee);

    // Get or create wallet
    let wallet = await prisma.wallet.findUnique({
      where: { userId: session.user.id },
    });

    if (!wallet) {
      wallet = await prisma.wallet.create({
        data: { userId: session.user.id },
      });
    }

    // Generate unique reference
    const reference = generatePaymentReference(session.user.id);

    // Create pending transaction
    const transaction = await prisma.transaction.create({
      data: {
        userId: session.user.id,
        walletId: wallet.id,
        type: "DEPOSIT",
        amount: totalAmountDecimal,
        fee: totalFeeDecimal,
        netAmount: baseAmountDecimal,
        description: `Wallet deposit of ₦${baseAmount.toLocaleString()} via ${
          method === "CARD" ? "Card" : "Bank Transfer"
        }`,
        status: "PENDING",
        balanceBefore: wallet.balance,
        balanceAfter: wallet.balance,
        processorTransactionId: reference,
        metadata: {
          paymentMethod: method,
          baseAmount,
          serviceFee,
          expectedPlatformFee: serviceFee, // For tracking variance during webhook
          processingFee,
          totalAmount
        } as any,
      },
    });

    try {
      // Initialize Paystack payment for BOTH card and bank transfer
      const paymentResponse = await initializePayment({
        email: session.user.email,
        amount: nairaToKobo(totalAmount),
        reference,
        callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL}/wallet?payment=success`,
        metadata: {
          userId: session.user.id,
          transactionId: transaction.id,
          method,
        },
        // Specify payment channels
        channels: method === "CARD" ? ["card"] : ["bank", "bank_transfer"],
      });

      // Log the action
      await logFinancialAction(
        session.user.id,
        "deposit_initiated",
        `${
          method === "CARD" ? "Card" : "Bank transfer"
        } deposit of ₦${baseAmount.toLocaleString()} initiated (Total: ₦${totalAmount.toLocaleString()})`,
        { baseAmount, totalAmount, reference, method }
      );

      return NextResponse.json({
        success: true,
        authorizationUrl: paymentResponse.data.authorization_url,
        reference,
        transactionId: transaction.id,
        method,
      });
    } catch (error: any) {
      // If Paystack initialization fails, delete the transaction
      await prisma.transaction.delete({
        where: { id: transaction.id },
      });
      throw error;
    }
  } catch (error: any) {
    console.error("Deposit error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to initialize deposit" },
      { status: 500 }
    );
  }
}

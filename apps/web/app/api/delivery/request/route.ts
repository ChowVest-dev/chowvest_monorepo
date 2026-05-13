import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@chowvest/database";
import { Prisma } from "@chowvest/database";
import { logAction } from "@/lib/audit";
import { sendDeliveryStatusEmail } from "@/lib/email-delivery";
import {
  sendDeliveryRequestNotification,
  sendDeliveryStatusNotification,
} from "@/lib/notifications/delivery";

// Default fallback fees (used only if DB config hasn't been seeded)
const FEE_DEFAULTS: Record<string, number> = {
  DELIVERY_FEE_EXPRESS:   1200,
  DELIVERY_FEE_STANDARD:  700,
  DELIVERY_FEE_SCHEDULED: 500,
  SERVICE_FEE:            100,
};

// Simulated rider pool
const RIDERS = [
  { name: "Adebayo Kareem", phone: "0801-234-5678", rating: 4.9 },
  { name: "Chinedu Okafor", phone: "0802-345-6789", rating: 4.8 },
  { name: "Musa Ibrahim", phone: "0803-456-7890", rating: 4.7 },
  { name: "Tunde Bakare", phone: "0804-567-8901", rating: 4.9 },
  { name: "Emeka Nwosu", phone: "0805-678-9012", rating: 4.6 },
];


export async function POST(req: NextRequest) {
  try {
    // ─── Feature Kill Switch ───
    const { getFeatureFlags } = await import("@/lib/feature-flags");
    if (!getFeatureFlags().market) {
      return NextResponse.json(
        { error: "Deliveries are temporarily unavailable. Please try again later." },
        { status: 503 }
      );
    }

    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      basketId,
      address,
      addressLabel,
      deliveryNote,
      deliveryOption = "STANDARD",
    } = body;

    if (!basketId || !address) {
      return NextResponse.json(
        { error: "Basket ID and delivery address are required" },
        { status: 400 }
      );
    }

    if (!["EXPRESS", "STANDARD", "SCHEDULED"].includes(deliveryOption)) {
      return NextResponse.json(
        { error: "Invalid delivery option" },
        { status: 400 }
      );
    }

    // Fetch live delivery fees from DB (admin-configurable), fall back to defaults
    const configs = await prisma.platformConfig.findMany({
      where: { key: { in: ["DELIVERY_FEE_EXPRESS", "DELIVERY_FEE_STANDARD", "DELIVERY_FEE_SCHEDULED", "SERVICE_FEE"] } },
    });
    const configMap = Object.fromEntries(configs.map((c) => [c.key, parseFloat(c.value)]));
    const DELIVERY_FEES: Record<string, number> = {
      EXPRESS:   configMap["DELIVERY_FEE_EXPRESS"]   ?? FEE_DEFAULTS["DELIVERY_FEE_EXPRESS"],
      STANDARD:  configMap["DELIVERY_FEE_STANDARD"]  ?? FEE_DEFAULTS["DELIVERY_FEE_STANDARD"],
      SCHEDULED: configMap["DELIVERY_FEE_SCHEDULED"] ?? FEE_DEFAULTS["DELIVERY_FEE_SCHEDULED"],
    };
    const SERVICE_FEE = configMap["SERVICE_FEE"] ?? FEE_DEFAULTS["SERVICE_FEE"];

    // Verify basket belongs to user and is complete
    const basket = await prisma.basket.findFirst({
      where: {
        id: basketId,
        userId: session.user.id,
      },
    });

    if (!basket) {
      return NextResponse.json(
        { error: "Basket not found" },
        { status: 404 }
      );
    }

    const currentAmount = Number(basket.currentAmount);
    const goalAmount = Number(basket.goalAmount);

    if (currentAmount < goalAmount) {
      return NextResponse.json(
        { error: "Savings goal has not been reached yet" },
        { status: 400 }
      );
    }

    // Check for existing pending delivery
    const existingDelivery = await prisma.delivery.findFirst({
      where: {
        basketId,
        userId: session.user.id,
        status: { in: ["PENDING", "CONFIRMED", "PREPARING", "IN_TRANSIT"] },
      },
    });

    if (existingDelivery) {
      return NextResponse.json(
        { error: "A delivery is already in progress for this basket" },
        { status: 400 }
      );
    }

    const deliveryFee = DELIVERY_FEES[deliveryOption] || 700;
    const totalFee = new Prisma.Decimal(deliveryFee + SERVICE_FEE);
    
    // Check wallet balance
    const wallet = await prisma.wallet.findUnique({
      where: { userId: session.user.id },
    });

    if (!wallet) {
      return NextResponse.json({ error: "Wallet not found" }, { status: 404 });
    }
    
    if (wallet.balance.lessThan(totalFee)) {
      return NextResponse.json(
        { error: "Insufficient wallet balance for delivery fees" },
        { status: 400 }
      );
    }

    // Simulate rider assignment
    const rider = RIDERS[Math.floor(Math.random() * RIDERS.length)];

    // Generate 4-digit delivery handshake PIN
    const deliveryPin = String(Math.floor(1000 + Math.random() * 9000));

    // Calculate estimated delivery time
    const now = new Date();
    let estimatedMinutes = 60;
    if (deliveryOption === "EXPRESS") estimatedMinutes = 40;
    if (deliveryOption === "SCHEDULED") estimatedMinutes = 180;
    const estimatedAt = new Date(now.getTime() + estimatedMinutes * 60000);

    const delivery = await prisma.$transaction(async (tx) => {
      // Create delivery
      const newDelivery = await tx.delivery.create({
        data: {
          userId: session.user.id,
          deliveryType: "BASKET",
          orderId: basket.id,
          basketId: basket.id,
          status: "PENDING",
          address,
          addressLabel: addressLabel || null,
          deliveryNote: deliveryNote || null,
          deliveryOption,
          deliveryFee,
          serviceFee: SERVICE_FEE,
          riderName: rider.name,
          riderPhone: rider.phone,
          riderRating: rider.rating,
          estimatedAt,
          requestedAt: now,
          deliveryPin,
        },
      });

      // Update basket status to COMPLETED
      await tx.basket.update({
        where: { id: basketId },
        data: {
          status: "COMPLETED",
          completedAt: now,
        },
      });

      // Deduct fee from wallet
      const updatedWallet = await tx.wallet.update({
        where: { id: wallet.id },
        data: { balance: { decrement: totalFee } }
      });

      // 1. Create delivery fee transaction log
      const balanceAfterDelivery = wallet.balance.sub(deliveryFee);
      await tx.transaction.create({
        data: {
          userId: session.user.id,
          walletId: wallet.id,
          basketId: basket.id,
          type: "DELIVERY_FEE",
          amount: deliveryFee,
          netAmount: deliveryFee,
          description: `Delivery Fee for ${basket.name}`,
          status: "COMPLETED",
          balanceBefore: wallet.balance,
          balanceAfter: balanceAfterDelivery,
          completedAt: now,
        }
      });

      // 2. Create service fee transaction log
      await tx.transaction.create({
        data: {
          userId: session.user.id,
          walletId: wallet.id,
          basketId: basket.id,
          type: "SERVICE_FEE",
          amount: SERVICE_FEE,
          netAmount: SERVICE_FEE,
          description: `Platform Service Fee for ${basket.name}`,
          status: "COMPLETED",
          balanceBefore: balanceAfterDelivery,
          balanceAfter: updatedWallet.balance,
          completedAt: now,
        }
      });

      return newDelivery;
    });

    // Get commodity info for notifications
    const commodity = basket.commodityType
      ? await prisma.commodity.findUnique({ where: { sku: basket.commodityType } })
      : null;
    const itemName = commodity
      ? `${commodity.name} (${commodity.size}${commodity.unit})`
      : basket.name;

    // Send notification
    await sendDeliveryRequestNotification(
      session.user.id,
      itemName,
      address
    );

    // Send confirmation email
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { email: true, fullName: true },
    });

    if (user) {
      await sendDeliveryStatusEmail({
        email: user.email,
        name: user.fullName,
        orderId: delivery.id,
        status: "CONFIRMED",
        address,
        deliveryOption,
        itemName,
        totalAmount: goalAmount + deliveryFee + SERVICE_FEE,
        deliveryFee,
        riderName: rider.name,
        riderPhone: rider.phone,
        estimatedTime: estimatedAt.toLocaleTimeString("en-NG", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      });
    }

    await logAction({
      userId: session.user.id,
      action: "delivery_requested",
      category: "financial",
      description: `Delivery requested for basket: ${basket.name}`,
      metadata: {
        deliveryId: delivery.id,
        basketId,
        deliveryOption,
        deliveryFee,
        address,
      },
    });

    return NextResponse.json(
      {
        delivery: {
          ...delivery,
          deliveryFee: Number(delivery.deliveryFee),
          serviceFee: Number(delivery.serviceFee),
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Create delivery error:", error);
    return NextResponse.json(
      { error: "Failed to create delivery" },
      { status: 500 }
    );
  }
}

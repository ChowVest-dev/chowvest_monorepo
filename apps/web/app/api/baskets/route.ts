import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@chowvest/database";
import { logAction } from "@/lib/audit";
import { Prisma } from "@chowvest/database";

// GET - List user's baskets
export async function GET(req: NextRequest) {
  try {
    const session = await getSession();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [baskets, wallet, activeDeliveriesCount] = await Promise.all([
      prisma.basket.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
        include: {
          deliveries: true,
          _count: {
            select: { transactions: true },
          },
        },
      }),
      prisma.wallet.findUnique({
        where: { userId: session.user.id },
      }),
      prisma.delivery.count({
        where: {
          userId: session.user.id,
          status: { in: ["PENDING", "CONFIRMED", "PREPARING", "IN_TRANSIT"] },
        },
      }),
    ]);

    // Convert Decimal fields to strings for JSON serialization
    const basketsWithStrings = baskets.map((basket) => ({
      ...basket,
      goalAmount: basket.goalAmount.toString(),
      currentAmount: basket.currentAmount.toString(),
      regularTopUp: basket.regularTopUp?.toString(),
      autoSaveAmount: basket.autoSaveAmount?.toString(),
    }));

    return NextResponse.json({
      baskets: basketsWithStrings,
      walletBalance: Number(wallet?.balance || 0),
      activeDeliveriesCount,
    });
  } catch (error: any) {
    console.error("Get baskets error:", error);
    return NextResponse.json(
      { error: "Failed to fetch baskets" },
      { status: 500 }
    );
  }
}

// POST - Create new basket
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      name,
      commodityType,
      image,
      description,
      category,
      goalAmount,
      targetDate,
      regularTopUp,
      autoSaveEnabled,
      autoSaveAmount,
      autoSaveFrequency,
    } = body;

    if (!name || !goalAmount || goalAmount <= 0) {
      return NextResponse.json(
        { error: "Name and valid goal amount are required" },
        { status: 400 }
      );
    }

    // Convert to Decimal
    const goalAmountDecimal = new Prisma.Decimal(goalAmount);
    const regularTopUpDecimal = regularTopUp
      ? new Prisma.Decimal(regularTopUp)
      : null;
    const autoSaveAmountDecimal = autoSaveAmount
      ? new Prisma.Decimal(autoSaveAmount)
      : null;

    // Validate auto-save settings
    if (autoSaveEnabled) {
      if (!autoSaveAmount || !autoSaveFrequency) {
        return NextResponse.json(
          {
            error:
              "Auto-save amount and frequency are required when auto-save is enabled",
          },
          { status: 400 }
        );
      }

      if (
        autoSaveAmountDecimal &&
        autoSaveAmountDecimal.greaterThan(goalAmountDecimal)
      ) {
        return NextResponse.json(
          { error: "Auto-save amount cannot exceed goal amount" },
          { status: 400 }
        );
      }
    }

    const basket = await prisma.basket.create({
      data: {
        userId: session.user.id,
        name,
        commodityType,
        image,
        description,
        category: category || "Foodstuff",
        goalAmount: goalAmountDecimal,
        targetDate: targetDate ? new Date(targetDate) : null,
        regularTopUp: regularTopUpDecimal,
        autoSaveEnabled: autoSaveEnabled || false,
        autoSaveAmount: autoSaveAmountDecimal,
        autoSaveFrequency,
        nextAutoSaveAt: autoSaveEnabled
          ? calculateNextAutoSave(autoSaveFrequency)
          : null,
      },
    });

    await logAction({
      userId: session.user.id,
      action: "basket_created",
      category: "financial",
      description: `Created basket: ${name}`,
      metadata: {
        basketId: basket.id,
        goalAmount: goalAmountDecimal.toString(),
        autoSaveEnabled,
      },
    });

    return NextResponse.json(
      {
        basket: {
          ...basket,
          goalAmount: basket.goalAmount.toString(),
          currentAmount: basket.currentAmount.toString(),
          regularTopUp: basket.regularTopUp?.toString(),
          autoSaveAmount: basket.autoSaveAmount?.toString(),
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Create basket error:", error);
    return NextResponse.json(
      { error: "Failed to create basket" },
      { status: 500 }
    );
  }
}

// Helper function to calculate next auto-save date
function calculateNextAutoSave(frequency: string): Date {
  const now = new Date();

  switch (frequency) {
    case "daily":
      return new Date(now.setDate(now.getDate() + 1));
    case "weekly":
      return new Date(now.setDate(now.getDate() + 7));
    case "monthly":
      return new Date(now.setMonth(now.getMonth() + 1));
    default:
      return new Date(now.setDate(now.getDate() + 1));
  }
}

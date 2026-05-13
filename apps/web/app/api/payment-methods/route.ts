import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@chowvest/database";

// GET - List user's payment methods
export async function GET(req: NextRequest) {
  try {
    const session = await getSession();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const paymentMethods = await prisma.paymentMethod.findMany({
      where: { userId: session.user.id, isActive: true },
      orderBy: [{ isPrimary: "desc" }, { lastUsedAt: "desc" }],
      select: {
        id: true,
        type: true,
        provider: true,
        cardBrand: true,
        cardLast4: true,
        cardExpMonth: true,
        cardExpYear: true,
        cardBank: true,
        bankName: true,
        accountNumber: true,
        isPrimary: true,
        isActive: true,
        createdAt: true,
        lastUsedAt: true,
      },
    });

    return NextResponse.json({ paymentMethods });
  } catch (error: any) {
    console.error("Get payment methods error:", error);
    return NextResponse.json(
      { error: "Failed to fetch payment methods" },
      { status: 500 }
    );
  }
}

// POST - Add new payment method
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      type,
      provider,
      authorizationCode,
      cardBrand,
      cardLast4,
      cardExpMonth,
      cardExpYear,
      cardBin,
      cardBank,
      cardCountry,
      signature,
      isPrimary,
    } = body;

    if (!type || !provider) {
      return NextResponse.json(
        { error: "Type and provider are required" },
        { status: 400 }
      );
    }

    // If setting as primary, unset other primary methods
    if (isPrimary) {
      await prisma.paymentMethod.updateMany({
        where: { userId: session.user.id, isPrimary: true },
        data: { isPrimary: false },
      });
    }

    const paymentMethod = await prisma.paymentMethod.create({
      data: {
        userId: session.user.id,
        type,
        provider,
        authorizationCode,
        cardBrand,
        cardLast4,
        cardExpMonth,
        cardExpYear,
        cardBin,
        cardBank,
        cardCountry,
        signature,
        isPrimary: isPrimary || false,
      },
    });

    return NextResponse.json({ paymentMethod }, { status: 201 });
  } catch (error: any) {
    console.error("Add payment method error:", error);
    return NextResponse.json(
      { error: "Failed to add payment method" },
      { status: 500 }
    );
  }
}

// DELETE - Remove payment method
export async function DELETE(req: NextRequest) {
  try {
    const session = await getSession();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Payment method ID is required" },
        { status: 400 }
      );
    }

    // Soft delete by marking as inactive
    await prisma.paymentMethod.updateMany({
      where: {
        id,
        userId: session.user.id,
      },
      data: {
        isActive: false,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Payment method removed",
    });
  } catch (error: any) {
    console.error("Delete payment method error:", error);
    return NextResponse.json(
      { error: "Failed to remove payment method" },
      { status: 500 }
    );
  }
}

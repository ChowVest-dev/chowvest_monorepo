import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@chowvest/database";
import { logAction } from "@/lib/audit";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> } // params is a Promise in Next.js 15+ (if using recent version, but safe to await)
) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const basket = await prisma.basket.findUnique({
      where: { id },
    });

    if (!basket) {
      return NextResponse.json({ error: "Basket not found" }, { status: 404 });
    }

    if (basket.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Only allow deletion if the basket is already CANCELLED
    if (basket.status !== "CANCELLED") {
      return NextResponse.json(
        {
          error:
            "Active goals cannot be deleted directly. Please cancel the goal first to refund your funds.",
        },
        { status: 400 }
      );
    }

    // Perform permanent deletion
    await prisma.basket.delete({
      where: { id },
    });

    await logAction({
      userId: session.user.id,
      action: "basket_deleted",
      category: "financial",
      description: `Permanently deleted basket: ${basket.name}`,
      metadata: { basketId: id },
    });

    return NextResponse.json({ success: true, message: "Goal deleted permanently" });
  } catch (error) {
    console.error("Delete basket error:", error);
    return NextResponse.json(
      { error: "Failed to delete basket" },
      { status: 500 }
    );
  }
}

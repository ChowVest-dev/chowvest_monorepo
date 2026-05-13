import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@chowvest/database";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: deliveryId } = await params;
    const { rating } = await req.json();

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 });
    }

    const delivery = await prisma.delivery.findFirst({
      where: { id: deliveryId, userId: session.user.id },
    });

    if (!delivery) {
      return NextResponse.json({ error: "Delivery not found" }, { status: 404 });
    }

    await prisma.delivery.update({
      where: { id: deliveryId },
      data: { userRating: rating },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Rate delivery error:", error);
    return NextResponse.json({ error: "Failed to save rating" }, { status: 500 });
  }
}

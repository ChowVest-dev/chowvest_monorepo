import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@chowvest/database";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { deliveryId, status } = await req.json();

    if (!deliveryId || !status) {
      return NextResponse.json(
        { error: "Delivery ID and status are required" },
        { status: 400 }
      );
    }

    // Verify delivery belongs to user
    const delivery = await prisma.delivery.findFirst({
      where: {
        id: deliveryId,
        userId: session.user.id,
      },
    });

    if (!delivery) {
      return NextResponse.json(
        { error: "Delivery not found" },
        { status: 404 }
      );
    }

    const updateData: any = { status };
    
    if (status === "DELIVERED") {
      updateData.deliveredAt = new Date();
    }

    const updatedDelivery = await prisma.delivery.update({
      where: { id: deliveryId },
      data: updateData,
    });

    return NextResponse.json(
      { delivery: updatedDelivery, success: true },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Update delivery status error:", error);
    return NextResponse.json(
      { error: "Failed to update delivery status" },
      { status: 500 }
    );
  }
}


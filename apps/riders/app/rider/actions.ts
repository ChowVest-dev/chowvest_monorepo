"use server";

import { prisma } from "@chowvest/database";
import { revalidatePath } from "next/cache";

// These actions assume we know the riderId from a session. 
// For now, we will pass riderId directly until auth is fully wired.

export async function getActiveDelivery(riderId: string) {
  // Find a delivery assigned to this rider that is NOT completed or cancelled
  return await prisma.delivery.findFirst({
    where: {
      riderId,
      status: {
        notIn: ["DELIVERED", "CANCELLED"]
      }
    },
    include: {
      user: {
        select: {
          fullName: true,
          phoneNumber: true,
        }
      }
    }
  });
}

export async function updateDeliveryStatus(deliveryId: string, newStatus: string) {
  const now = new Date();
  const updates: any = { status: newStatus };

  if (newStatus === "CONFIRMED") updates.confirmedAt = now;
  if (newStatus === "PREPARING") updates.preparingAt = now;
  if (newStatus === "IN_TRANSIT") updates.dispatchedAt = now;
  if (newStatus === "AT_CUSTOMER") updates.arrivedAt = now;

  const delivery = await prisma.delivery.update({
    where: { id: deliveryId },
    data: updates,
  });
  
  revalidatePath("/rider/dashboard");
  return delivery;
}

export async function verifyAndCompleteDelivery(deliveryId: string, inputPin: string) {
  const delivery = await prisma.delivery.findUnique({
    where: { id: deliveryId },
    select: { deliveryPin: true, status: true }
  });

  if (!delivery) throw new Error("Delivery not found");
  if (delivery.status === "DELIVERED") throw new Error("Delivery already completed");

  // Verify PIN
  if (!delivery.deliveryPin) {
    throw new Error("Delivery PIN not set");
  }
  if (delivery.deliveryPin !== inputPin) {
    throw new Error("Invalid PIN");
  }

  // Complete delivery
  const updated = await prisma.delivery.update({
    where: { id: deliveryId },
    data: {
      status: "DELIVERED",
      deliveredAt: new Date()
    },
  });

  revalidatePath("/rider/dashboard");
  return updated;
}

export async function toggleRiderStatus(riderId: string, isOnline: boolean) {
  const rider = await prisma.rider.update({
    where: { id: riderId },
    data: { status: isOnline ? "ONLINE" : "OFFLINE" }
  });
  
  revalidatePath("/rider/dashboard");
  return rider;
}

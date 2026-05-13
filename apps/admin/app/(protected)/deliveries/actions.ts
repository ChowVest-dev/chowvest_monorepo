"use server";

import { prisma } from "@chowvest/database";
import { requireAdminSession } from "@/lib/auth/admin";
import { revalidatePath } from "next/cache";

export async function updateDeliveryStatus(deliveryId: string, newStatus: string) {
  await requireAdminSession();

  const validStatuses = ["PENDING", "CONFIRMED", "PREPARING", "IN_TRANSIT", "AT_CUSTOMER", "DELIVERED", "CANCELLED"];
  if (!validStatuses.includes(newStatus)) {
    throw new Error("Invalid delivery status");
  }

  const delivery = await prisma.delivery.findUnique({ where: { id: deliveryId } });
  if (!delivery) throw new Error("Delivery not found");

  // Track relevant timestamps
  const updates: any = { status: newStatus };
  const now = new Date();
  
  if (newStatus === "CONFIRMED" && !delivery.confirmedAt) updates.confirmedAt = now;
  if (newStatus === "PREPARING" && !delivery.preparingAt) updates.preparingAt = now;
  if (newStatus === "IN_TRANSIT" && !delivery.dispatchedAt) updates.dispatchedAt = now;
  if (newStatus === "AT_CUSTOMER" && !delivery.arrivedAt) updates.arrivedAt = now;
  if (newStatus === "DELIVERED" && !delivery.deliveredAt) updates.deliveredAt = now;

  // Execute update alongside an automated user notification
  await prisma.$transaction([
    prisma.delivery.update({
      where: { id: deliveryId },
      data: updates
    }),
    prisma.notification.create({
      data: {
        userId: delivery.userId,
        type: "delivery_update",
        title: "Delivery Status Update",
        message: `Your food delivery is now: ${newStatus.replace("_", " ")}.`,
        link: `/dashboard` // Send them to dashboard track active deliveries
      }
    })
  ]);

  revalidatePath(`/deliveries`);
  revalidatePath(`/deliveries/${deliveryId}`);
  return { success: true, status: newStatus };
}

export async function assignFleet(deliveryId: string, logisticsCompanyId: string, riderId?: string) {
  await requireAdminSession();

  if (!logisticsCompanyId) throw new Error("Logistics company is required");

  await prisma.delivery.update({
    where: { id: deliveryId },
    data: {
      logisticsCompanyId,
      riderId: riderId || null,
    }
  });

  revalidatePath(`/deliveries/${deliveryId}`);
  revalidatePath(`/deliveries`);
  return { success: true };
}

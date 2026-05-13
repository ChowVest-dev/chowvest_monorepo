import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@chowvest/database";
import RiderDashboardClient from "./client";

export default async function RiderDashboardPage() {
  const cookieStore = await cookies();
  const riderId = cookieStore.get("rider_session")?.value;

  if (!riderId) {
    redirect("/rider/login");
  }

  // Fetch the rider
  const rider = await prisma.rider.findUnique({
    where: { id: riderId }
  });

  if (!rider || !rider.isActive) {
    redirect("/rider/login");
  }

  // Fetch the active delivery
  const activeDelivery = await prisma.delivery.findFirst({
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

  const serializedRider = {
    ...rider,
    createdAt: rider.createdAt.toISOString(),
    updatedAt: rider.updatedAt.toISOString(),
  };

  const serializedDelivery = activeDelivery ? {
    ...activeDelivery,
    deliveryFee: Number(activeDelivery.deliveryFee),
    serviceFee: Number(activeDelivery.serviceFee),
    userTip: activeDelivery.userTip != null ? Number(activeDelivery.userTip) : null,
    lat: activeDelivery.lat != null ? Number(activeDelivery.lat) : null,
    lng: activeDelivery.lng != null ? Number(activeDelivery.lng) : null,
    estimatedAt: activeDelivery.estimatedAt?.toISOString() ?? null,
    confirmedAt: activeDelivery.confirmedAt?.toISOString() ?? null,
    preparingAt: activeDelivery.preparingAt?.toISOString() ?? null,
    requestedAt: activeDelivery.requestedAt?.toISOString() ?? null,
    dispatchedAt: activeDelivery.dispatchedAt?.toISOString() ?? null,
    arrivedAt: activeDelivery.arrivedAt?.toISOString() ?? null,
    deliveredAt: activeDelivery.deliveredAt?.toISOString() ?? null,
    createdAt: activeDelivery.createdAt.toISOString(),
    updatedAt: activeDelivery.updatedAt.toISOString(),
    user: activeDelivery.user,
  } : null;

  return (
    <RiderDashboardClient
      rider={serializedRider}
      initialDelivery={serializedDelivery}
    />
  );
}

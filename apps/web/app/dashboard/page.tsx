"use server";

import { Suspense } from "react";
import { redirect } from "next/navigation";
import { Navigation } from "@/components/navigation";
import { DashboardClient } from "./client-wrapper";
import { getSession } from "@/lib/auth";
import { DashboardSkeleton } from "@/components/loaders/dashboard-skeleton";

import { prisma } from "@chowvest/database";

export default async function DashboardPage() {
  const session = await getSession();

  // Protect the page
  if (!session?.user) {
    redirect("/auth");
  }

  // Fetch dashboard data
  const [wallet, baskets, activeDeliveries] = await Promise.all([
    prisma.wallet.findUnique({
      where: { userId: session.user.id },
    }),
    prisma.basket.findMany({
      where: { userId: session.user.id, status: "ACTIVE" },
      orderBy: { createdAt: "desc" },
    }),
    prisma.delivery.findMany({
      where: {
        userId: session.user.id,
        status: { in: ["PENDING", "CONFIRMED", "PREPARING", "IN_TRANSIT"] },
      },
      include: {
        basket: true,
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const totalSavings = baskets.reduce(
    (sum, basket) => sum + Number(basket.currentAmount),
    0
  );

  const serializedDeliveries = activeDeliveries.map(d => ({
    id: d.id,
    basketId: d.basketId,
    status: d.status,
    commodityName: d.basket?.name || "Food Items",
    image: d.basket?.image || "/rice.jpg",
    amount: Number(d.basket?.goalAmount || 0),
    riderName: d.riderName,
    riderRating: d.riderRating,
    deliveryOption: d.deliveryOption,
  }));

  return (
    <>
      <Navigation activeDeliveryCount={activeDeliveries.length} />
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardClient
          walletBalance={Number(wallet?.balance || 0)}
          totalSavings={totalSavings}
          activeDeliveries={serializedDeliveries}
          baskets={baskets.map((b) => ({
            id: b.id,
            name: b.name,
            goalAmount: Number(b.goalAmount),
            currentAmount: Number(b.currentAmount),
            image: b.image,
            commodityType: b.commodityType,
            category: b.category,
          }))}
        />
      </Suspense>
    </>
  );
}

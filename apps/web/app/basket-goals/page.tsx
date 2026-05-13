import { Suspense } from "react";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@chowvest/database";
import { Navigation } from "@/components/navigation";
import { BasketGoalsSkeleton } from "@/components/loaders/basket-goals-skeleton";

//import { BasketSync } from "@/hooks/basket-sync";

import BasketGoalsClientWrapper from "./client-wrapper";

export default async function BasketGoalsPage() {
  const session = await getSession();

  if (!session?.user) {
    redirect("/auth");
  }

  const [baskets, wallet, activeDeliveryCount] = await Promise.all([
    prisma.basket.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        deliveries: true,
      },
      orderBy: { createdAt: "desc" },
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

  const serializedBaskets = baskets.map((basket) => ({
    id: basket.id,
    name: basket.name,
    commodityType: basket.commodityType,
    image: basket.image,
    goalAmount: Number(basket.goalAmount),
    currentAmount: Number(basket.currentAmount),
    description: basket.description,
    targetDate: basket.targetDate?.toISOString() || null,
    regularTopUp: Number(basket.regularTopUp || 0),
    category: basket.category,
    status: basket.status,
    createdAt: basket.createdAt.toISOString(),
    deliveries: basket.deliveries.map(d => ({
      ...d,
      deliveryFee: Number(d.deliveryFee),
      serviceFee: Number(d.serviceFee),
      createdAt: d.createdAt.toISOString(),
      updatedAt: d.updatedAt.toISOString(),
      estimatedAt: d.estimatedAt?.toISOString() || null,
    })),
  }));

  const walletBalance = Number(wallet?.balance || 0);

  return (
    <>
      <Navigation />
      <Suspense fallback={<BasketGoalsSkeleton />}>
        <BasketGoalsClientWrapper
          serializedBaskets={serializedBaskets}
          walletBalance={walletBalance}
          initialActiveDeliveriesCount={activeDeliveryCount}
        />
      </Suspense>
    </>
  );
}

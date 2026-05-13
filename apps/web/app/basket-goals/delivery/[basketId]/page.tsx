import { Suspense } from "react";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@chowvest/database";
import { DeliveryFlow } from "@/components/delivery/delivery-flow";
import { DeliveryContainer } from "@/components/delivery/delivery-container";

export default async function DeliveryPage({
  params,
}: {
  params: Promise<{ basketId: string }>;
}) {
  const session = await getSession();

  if (!session?.user) {
    redirect("/auth");
  }

  const { basketId } = await params;

  const [basket, wallet] = await Promise.all([
    prisma.basket.findFirst({
      where: {
        id: basketId,
        userId: session.user.id,
      },
    }),
    prisma.wallet.findUnique({
      where: { userId: session.user.id },
      select: { balance: true }
    })
  ]);

  if (!basket) {
    redirect("/basket-goals");
  }

  const currentAmount = Number(basket.currentAmount);
  const goalAmount = Number(basket.goalAmount);

  if (currentAmount < goalAmount && basket.status !== "COMPLETED") {
    redirect("/basket-goals");
  }

  const serializedBasket = {
    id: basket.id,
    name: basket.name,
    commodityType: basket.commodityType,
    image: basket.image,
    goalAmount: goalAmount,
    currentAmount: currentAmount,
    description: basket.description,
    status: basket.status,
  };

  const dbCommodity = basket.commodityType
    ? await prisma.commodity.findUnique({ where: { sku: basket.commodityType } })
    : null;

  const commodity = dbCommodity ? {
    id: dbCommodity.id,
    sku: dbCommodity.sku,
    name: dbCommodity.name,
    category: dbCommodity.category,
    brand: dbCommodity.brand,
    price: Number(dbCommodity.price),
    unit: dbCommodity.unit,
    size: Number(dbCommodity.size),
    image: dbCommodity.image,
    description: dbCommodity.description,
    marketType: dbCommodity.marketType,
    isActive: dbCommodity.isActive
  } : null;

  const commodityName = commodity ? commodity.name : basket.name;

  const existingDelivery = await prisma.delivery.findFirst({
    where: {
      basketId,
      userId: session.user.id,
      status: { in: ["PENDING", "CONFIRMED", "PREPARING", "IN_TRANSIT", "AT_CUSTOMER", "DELIVERED"] },
    },
    include: {
      rider: true
    },
    orderBy: { createdAt: "desc" },
  });

  const serializedDelivery = existingDelivery ? {
    ...existingDelivery,
    deliveryFee: Number(existingDelivery.deliveryFee),
    serviceFee: Number(existingDelivery.serviceFee),
    createdAt: existingDelivery.createdAt.toISOString(),
    updatedAt: existingDelivery.updatedAt.toISOString(),
    estimatedAt: existingDelivery.estimatedAt?.toISOString() || null,
    confirmedAt: existingDelivery.confirmedAt?.toISOString() || null,
    deliveredAt: existingDelivery.deliveredAt?.toISOString() || null,
  } : null;

  return (
    <DeliveryContainer commodityName={commodityName} mode={existingDelivery ? "TRACKING" : "CHECKOUT"}>
      <Suspense fallback={<div className="flex justify-center items-center h-full w-full"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1B7A3D]"></div></div>}>
        <DeliveryFlow 
          basket={serializedBasket} 
          commodity={commodity} 
          existingDelivery={serializedDelivery} 
          walletBalance={wallet ? Number(wallet.balance) : 0} 
        />
      </Suspense>
    </DeliveryContainer>
  );
}

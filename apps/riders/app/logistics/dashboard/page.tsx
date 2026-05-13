import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@chowvest/database";
import DashboardClient from "./DashboardClient";

export default async function LogisticsDashboardPage() {
  const cookieStore = await cookies();
  const companyId = cookieStore.get("logistics_session")?.value;

  if (!companyId) {
    redirect("/logistics/login");
  }

  // Fetch company details
  const company = await prisma.logisticsCompany.findUnique({
    where: { id: companyId },
  });

  if (!company || !company.isActive) {
    redirect("/logistics/login");
  }

  // Fetch fleet (riders) with their active delivery status
  const riders = await prisma.rider.findMany({
    where: { companyId },
    include: {
      deliveries: {
        where: {
          status: { in: ["CONFIRMED", "PREPARING", "IN_TRANSIT", "AT_CUSTOMER"] }
        }
      }
    },
    orderBy: { fullName: "asc" },
  });

  // Fetch pending deliveries assigned to this company
  const pendingDeliveries = await prisma.delivery.findMany({
    where: { 
      logisticsCompanyId: companyId,
      status: "PENDING"
    },
    orderBy: { requestedAt: "desc" },
  });

  // Fetch ongoing deliveries
  const ongoingDeliveries = await prisma.delivery.findMany({
    where: {
      logisticsCompanyId: companyId,
      status: { in: ["CONFIRMED", "PREPARING", "IN_TRANSIT", "AT_CUSTOMER"] }
    },
    include: {
      rider: true
    },
    orderBy: { updatedAt: "desc" }
  });

  const activeDeliveriesCount = ongoingDeliveries.filter(d => ["IN_TRANSIT", "AT_CUSTOMER"].includes(d.status)).length;

  const serializeDelivery = (d: any) => ({
    ...d,
    deliveryFee: Number(d.deliveryFee),
    serviceFee: Number(d.serviceFee),
    userTip: d.userTip != null ? Number(d.userTip) : null,
    lat: d.lat != null ? Number(d.lat) : null,
    lng: d.lng != null ? Number(d.lng) : null,
    estimatedAt: d.estimatedAt?.toISOString() ?? null,
    confirmedAt: d.confirmedAt?.toISOString() ?? null,
    preparingAt: d.preparingAt?.toISOString() ?? null,
    requestedAt: d.requestedAt?.toISOString() ?? null,
    dispatchedAt: d.dispatchedAt?.toISOString() ?? null,
    arrivedAt: d.arrivedAt?.toISOString() ?? null,
    deliveredAt: d.deliveredAt?.toISOString() ?? null,
    createdAt: d.createdAt.toISOString(),
    updatedAt: d.updatedAt.toISOString(),
    rider: d.rider ? {
      ...d.rider,
      createdAt: d.rider.createdAt.toISOString(),
      updatedAt: d.rider.updatedAt.toISOString(),
    } : null,
  });

  const serializedCompany = {
    ...company,
    createdAt: company.createdAt.toISOString(),
    updatedAt: company.updatedAt.toISOString(),
  };

  const serializedRiders = riders.map(r => ({
    ...r,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
    deliveries: r.deliveries.map(serializeDelivery),
  }));

  return (
    <DashboardClient
      company={serializedCompany}
      riders={serializedRiders}
      pendingDeliveries={pendingDeliveries.map(serializeDelivery)}
      ongoingDeliveries={ongoingDeliveries.map(serializeDelivery)}
      activeDeliveriesCount={activeDeliveriesCount}
    />
  );
}

import { prisma } from "@chowvest/database";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@chowvest/ui";
import { Separator } from "@chowvest/ui";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Card } from "@chowvest/ui";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@chowvest/ui";
import { Badge } from "@chowvest/ui";
import Link from "next/link";
import { DeliveryStatusChanger, AssignLogisticsDropdown } from "./client-components";
import { KanbanBoard } from "./kanban";
import { SearchBar } from "@/components/search-bar";

export default async function AdminDeliveriesPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const query = (await searchParams).q || "";

  const [deliveries, companies] = await Promise.all([
    prisma.delivery.findMany({
      orderBy: { requestedAt: "desc" },
      where: query ? {
        OR: [
          { id: { contains: query, mode: "insensitive" } },
          { address: { contains: query, mode: "insensitive" } },
          { riderName: { contains: query, mode: "insensitive" } }
        ]
      } : undefined,
      include: {
        basket: { select: { name: true, image: true, commodityType: true } },
        logisticsCompany: { select: { name: true } },
        rider: { select: { fullName: true, phoneNumber: true } }
      }
    }),
    prisma.logisticsCompany.findMany({
      where: { isActive: true },
      select: { id: true, name: true }
    })
  ]);

  const activeDeliveries = deliveries.filter(d => ["PENDING", "CONFIRMED", "PREPARING", "IN_TRANSIT", "AT_CUSTOMER"].includes(d.status));
  const historicalDeliveries = deliveries.filter(d => ["DELIVERED", "CANCELLED"].includes(d.status));

  const serializeDelivery = (d: typeof deliveries[number]) => ({
    ...d,
    deliveryFee: Number(d.deliveryFee),
    serviceFee: Number(d.serviceFee),
    userTip: d.userTip != null ? Number(d.userTip) : null,
    lat: d.lat != null ? Number(d.lat) : null,
    lng: d.lng != null ? Number(d.lng) : null,
    estimatedAt: d.estimatedAt?.toISOString() ?? null,
    confirmedAt: d.confirmedAt?.toISOString() ?? null,
    preparingAt: d.preparingAt?.toISOString() ?? null,
    requestedAt: d.requestedAt.toISOString(),
    dispatchedAt: d.dispatchedAt?.toISOString() ?? null,
    arrivedAt: d.arrivedAt?.toISOString() ?? null,
    deliveredAt: d.deliveredAt?.toISOString() ?? null,
    createdAt: d.createdAt.toISOString(),
    updatedAt: d.updatedAt.toISOString(),
  });

  const serializedActiveDeliveries = activeDeliveries.map(serializeDelivery);

  const DeliveryTable = ({ data, companies }: { data: typeof deliveries, companies: any[] }) => (
    <div className="overflow-x-auto w-full">
      <table className="w-full text-sm text-left">
        <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b">
          <tr>
            <th className="px-6 py-4 font-medium">Order ID</th>
            <th className="px-6 py-4 font-medium">Logistics Dispatch</th>
            <th className="px-6 py-4 font-medium">Commodity / Address</th>
            <th className="px-6 py-4 font-medium">Status Control</th>
            <th className="px-6 py-4 font-medium">Requested</th>
            <th className="px-6 py-4 font-medium text-right">Details</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {data.map((delivery) => (
            <tr key={delivery.id} className="hover:bg-muted/30 transition-colors">
              <td className="px-6 py-4">
                <div className="font-mono text-xs text-muted-foreground mb-1">
                  {delivery.id.split("-").pop() || delivery.id.slice(0, 8)}
                </div>
                <div className="font-semibold text-xs">{delivery.deliveryOption}</div>
              </td>
              <td className="px-6 py-4 font-medium text-foreground min-w-[200px]">
                <div className="space-y-2">
                  <AssignLogisticsDropdown 
                    deliveryId={delivery.id} 
                    companies={companies} 
                    currentCompanyId={delivery.logisticsCompanyId} 
                  />
                  {delivery.logisticsCompany && (
                    <div className="text-[10px] text-muted-foreground">
                      Rider: {delivery.rider ? `${delivery.rider.fullName}` : "Awaiting Assignment"}
                    </div>
                  )}
                </div>
              </td>
              <td className="px-6 py-4 max-w-[200px] truncate" title={delivery.address}>
                <div className="font-medium text-xs mb-1 text-primary">{delivery.basket?.name || "Food Items"}</div>
                <div className="text-xs truncate">{delivery.address}</div>
              </td>
              <td className="px-6 py-4">
                <DeliveryStatusChanger deliveryId={delivery.id} currentStatus={delivery.status} />
              </td>
              <td className="px-6 py-4 text-xs text-muted-foreground">
                {new Date(delivery.requestedAt).toLocaleString()}
              </td>
              <td className="px-6 py-4 text-right">
                <Link 
                  href={`/deliveries/${delivery.id}`} 
                  className="text-primary font-medium hover:underline text-xs"
                >
                  View →
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b">
        <div className="flex items-center gap-2 px-4 w-full">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Delivery Operations</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Delivery Operations</h1>
            <p className="text-muted-foreground">Monitor and update the fulfillment pipeline.</p>
          </div>
          <div className="flex items-center gap-4">
            <SearchBar placeholder="Search ID, Address, or Rider..." />
            <Badge variant="outline" className="text-xs bg-green-500/10 text-green-600 border-green-500/20">
              {activeDeliveries.length} Active
            </Badge>
          </div>
        </div>

        <Tabs defaultValue="kanban" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="kanban">Kanban Board</TabsTrigger>
            <TabsTrigger value="active">Active List</TabsTrigger>
            <TabsTrigger value="history">Historical Log</TabsTrigger>
          </TabsList>

          <TabsContent value="kanban">
            <KanbanBoard deliveries={serializedActiveDeliveries} companies={companies} />
          </TabsContent>

          <TabsContent value="active">
            <Card className="rounded-xl border shadow-sm">
              <DeliveryTable data={activeDeliveries} companies={companies} />
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card className="rounded-xl border shadow-sm">
              <DeliveryTable data={historicalDeliveries} companies={companies} />
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}

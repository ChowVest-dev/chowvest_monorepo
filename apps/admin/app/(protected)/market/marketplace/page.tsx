import { prisma } from "@chowvest/database";
import {
  Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList,
  BreadcrumbPage, BreadcrumbSeparator,
} from "@chowvest/ui";
import { Separator } from "@chowvest/ui";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Card } from "@chowvest/ui";
import { Badge } from "@chowvest/ui";
import { EditCommodityButton, ToggleCommodityStatus, AddCommodityButton } from "../client-components";

export default async function MarketplacePage() {
  const commodities = await prisma.commodity.findMany({
    where: { marketType: { in: ["MARKETPLACE", "BOTH"] } },
    orderBy: { category: "asc" },
  });

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
                <BreadcrumbPage>Market › Marketplace</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-8 p-4 md:p-6 lg:p-8">
        <div>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Marketplace Catalogue</h1>
              <p className="text-muted-foreground">
                Manage products available for direct purchase in the Chowvest marketplace.
              </p>
            </div>
            <AddCommodityButton />
          </div>

          <Card className="rounded-xl border shadow-sm">
            <div className="overflow-x-auto w-full">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b">
                  <tr>
                    <th className="px-4 py-4 font-medium">Image</th>
                    <th className="px-4 py-4 font-medium">Commodity</th>
                    <th className="px-4 py-4 font-medium">SKU</th>
                    <th className="px-4 py-4 font-medium">Category</th>
                    <th className="px-4 py-4 font-medium">Size / Unit</th>
                    <th className="px-4 py-4 font-medium">Price (₦)</th>
                    <th className="px-4 py-4 font-medium">Status</th>
                    <th className="px-4 py-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {commodities.map((c) => (
                    <tr key={c.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        {c.image ? (
                          <img
                            src={c.image}
                            alt={c.name}
                            className="h-10 w-10 rounded-lg object-cover border"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground text-xs">
                            N/A
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold">{c.name}</div>
                        {c.brand && <div className="text-xs text-muted-foreground">{c.brand}</div>}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{c.sku}</td>
                      <td className="px-4 py-3 text-muted-foreground">{c.category}</td>
                      <td className="px-4 py-3 font-mono">{Number(c.size)}{c.unit}</td>
                      <td className="px-4 py-3 font-mono font-semibold">
                        ₦{Number(c.price).toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant="outline"
                          className={c.isActive
                            ? "bg-green-500/10 text-green-600 border-green-500/20"
                            : "bg-muted text-muted-foreground"}
                        >
                          {c.isActive ? "Active" : "Disabled"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <EditCommodityButton
                            commodity={{
                              id: c.id,
                              name: c.name,
                              sku: c.sku,
                              category: c.category,
                              brand: c.brand,
                              price: Number(c.price),
                              unit: c.unit,
                              size: Number(c.size),
                              image: c.image,
                              description: c.description,
                              marketType: c.marketType,
                            }}
                          />
                          <ToggleCommodityStatus commodityId={c.id} isActive={c.isActive} />
                        </div>
                      </td>
                    </tr>
                  ))}
                  {commodities.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-6 py-8 text-center text-muted-foreground">
                        No commodities in the catalogue yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}

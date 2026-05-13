import { prisma } from "@chowvest/database";
import {
  Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList,
  BreadcrumbPage, BreadcrumbSeparator,
} from "@chowvest/ui";
import { Separator } from "@chowvest/ui";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Card } from "@chowvest/ui";
import { Badge } from "@chowvest/ui";
import { EditCommodityButton, ToggleCommodityStatus, AddCommodityButton, EditConfigButton } from "./client-components";

// Default values in case DB hasn't been seeded yet
const CONFIG_DEFAULTS: Record<string, { label: string; default: string }> = {
  DELIVERY_FEE_EXPRESS:   { label: "Express Delivery Fee",   default: "1200" },
  DELIVERY_FEE_STANDARD:  { label: "Standard Delivery Fee",  default: "700" },
  DELIVERY_FEE_SCHEDULED: { label: "Scheduled Delivery Fee", default: "500" },
  SERVICE_FEE:            { label: "Service Fee",            default: "100" },
};

export default async function AdminMarketPage() {
  const [commodities, configs] = await Promise.all([
    prisma.commodity.findMany({ orderBy: { category: "asc" } }),
    prisma.platformConfig.findMany(),
  ]);

  const configMap = Object.fromEntries(configs.map((c) => [c.key, c.value]));

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
                <BreadcrumbPage>Market & Pricing</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-8 p-4 md:p-6 lg:p-8">
        {/* ── Commodity Catalogue ── */}
        <div>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Market Catalogue</h1>
              <p className="text-muted-foreground">Manage commodity prices and product availability.</p>
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
                    <th className="px-4 py-4 font-medium">Listed In</th>
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
                          className={
                            c.marketType === "BOTH"
                              ? "bg-blue-500/10 text-blue-600 border-blue-500/20"
                              : c.marketType === "MARKETPLACE"
                                ? "bg-purple-500/10 text-purple-600 border-purple-500/20"
                                : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                          }
                        >
                          {c.marketType === "BOTH" ? "Both" : c.marketType === "MARKETPLACE" ? "Marketplace" : "Savings"}
                        </Badge>
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
                      <td colSpan={9} className="px-6 py-8 text-center text-muted-foreground">
                        No commodities in the catalogue yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* ── Delivery & Fee Settings ── */}
        <div>
          <div className="mb-4">
            <h2 className="text-xl font-bold tracking-tight">Delivery & Fee Settings</h2>
            <p className="text-muted-foreground">
              These values are fetched live by the delivery API on every request.
            </p>
          </div>

          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {Object.entries(CONFIG_DEFAULTS).map(([key, { label, default: defaultVal }]) => {
              const currentValue = configMap[key] ?? defaultVal;
              return (
                <Card key={key} className="rounded-xl border shadow-sm p-5">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-1">{label}</p>
                  <p className="text-2xl font-bold font-mono">₦{Number(currentValue).toLocaleString()}</p>
                  <div className="mt-3">
                    <EditConfigButton configKey={key} currentValue={currentValue} label={label} />
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}

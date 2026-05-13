import { prisma } from "@chowvest/database";
import {
  Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList,
  BreadcrumbPage, BreadcrumbSeparator,
} from "@chowvest/ui";
import { Separator } from "@chowvest/ui";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Card } from "@chowvest/ui";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@chowvest/ui";
import { Badge } from "@chowvest/ui";
import { SearchBar } from "@/components/search-bar";
import Link from "next/link";

const STATUS_COLORS: Record<string, string> = {
  ACTIVE:    "bg-green-500/15 text-green-700 border-green-500/30",
  COMPLETED: "bg-blue-500/15 text-blue-700 border-blue-500/30",
  CANCELLED: "bg-red-500/15 text-red-700 border-red-500/30",
  PAUSED:    "bg-yellow-500/15 text-yellow-700 border-yellow-500/30",
};

export default async function AdminGoalsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; tab?: string }>;
}) {
  const { q: query = "" } = await searchParams;

  const baskets = await prisma.basket.findMany({
    orderBy: { createdAt: "desc" },
    where: query
      ? {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { commodityType: { contains: query, mode: "insensitive" } },
            { user: { fullName: { contains: query, mode: "insensitive" } } },
          ],
        }
      : undefined,
    include: {
      user: { select: { fullName: true, email: true, id: true } },
    },
  });

  // Stat counts
  const total     = baskets.length;
  const active    = baskets.filter((b) => b.status === "ACTIVE").length;
  const completed = baskets.filter((b) => b.status === "COMPLETED").length;
  const cancelled = baskets.filter((b) => b.status === "CANCELLED").length;

  // Commodity breakdown
  const commodityMap: Record<string, { count: number; totalSaved: number }> = {};
  for (const b of baskets) {
    const key = b.commodityType || "Uncategorised";
    if (!commodityMap[key]) commodityMap[key] = { count: 0, totalSaved: 0 };
    commodityMap[key].count++;
    commodityMap[key].totalSaved += Number(b.currentAmount);
  }
  const commodityBreakdown = Object.entries(commodityMap)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 8);
  const maxCount = Math.max(...commodityBreakdown.map(([, v]) => v.count), 1);

  const GoalTable = ({ data }: { data: typeof baskets }) => (
    <div className="overflow-x-auto w-full">
      <table className="w-full text-sm text-left">
        <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b">
          <tr>
            <th className="px-6 py-4 font-medium">Goal</th>
            <th className="px-6 py-4 font-medium">User</th>
            <th className="px-6 py-4 font-medium">Commodity</th>
            <th className="px-6 py-4 font-medium">Progress</th>
            <th className="px-6 py-4 font-medium">Status</th>
            <th className="px-6 py-4 font-medium">Created</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {data.map((basket) => {
            const pct = Math.min(
              100,
              Math.round((Number(basket.currentAmount) / Number(basket.goalAmount)) * 100)
            );
            return (
              <tr key={basket.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-6 py-4 font-medium max-w-[160px] truncate">{basket.name}</td>
                <td className="px-6 py-4">
                  <Link href={`/users/${basket.user.id}`} className="font-medium text-primary hover:underline block">
                    {basket.user.fullName}
                  </Link>
                  <span className="text-xs text-muted-foreground">{basket.user.email}</span>
                </td>
                <td className="px-6 py-4 capitalize text-muted-foreground">
                  {basket.commodityType || "—"}
                </td>
                <td className="px-6 py-4 min-w-[180px]">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-2 bg-green-500 rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-xs font-mono text-muted-foreground w-9 text-right">{pct}%</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    ₦{Number(basket.currentAmount).toLocaleString()} / ₦{Number(basket.goalAmount).toLocaleString()}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <Badge variant="outline" className={`text-[10px] h-5 ${STATUS_COLORS[basket.status] ?? ""}`}>
                    {basket.status}
                  </Badge>
                </td>
                <td className="px-6 py-4 text-muted-foreground text-xs whitespace-nowrap">
                  {new Date(basket.createdAt).toLocaleDateString()}
                </td>
              </tr>
            );
          })}
          {data.length === 0 && (
            <tr>
              <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                No goals found.
              </td>
            </tr>
          )}
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
                <BreadcrumbPage>Goals Overview</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Goals Overview</h1>
            <p className="text-muted-foreground">
              All basket savings goals across the platform.
            </p>
          </div>
          <SearchBar placeholder="Search goal, user, or commodity..." />
        </div>

        {/* Stat Cards */}
        <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
          {[
            { label: "Total Goals",     value: total,     color: "text-foreground" },
            { label: "Active",          value: active,    color: "text-green-600" },
            { label: "Completed",       value: completed, color: "text-blue-600" },
            { label: "Cancelled",       value: cancelled, color: "text-red-500" },
          ].map(({ label, value, color }) => (
            <div key={label} className="rounded-xl border bg-card shadow-sm p-5">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{label}</p>
              <p className={`text-3xl font-bold mt-1 ${color}`}>{value}</p>
            </div>
          ))}
        </div>

        {/* Commodity Breakdown */}
        {commodityBreakdown.length > 0 && (
          <Card className="p-6 rounded-xl border shadow-sm">
            <h2 className="font-semibold text-sm mb-4">Top Commodities Being Saved For</h2>
            <div className="space-y-3">
              {commodityBreakdown.map(([name, { count, totalSaved }]) => (
                <div key={name} className="flex items-center gap-3">
                  <span className="w-28 text-sm font-medium capitalize truncate">{name}</span>
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-2 bg-green-500 rounded-full"
                      style={{ width: `${(count / maxCount) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground w-8 text-right">{count}</span>
                  <span className="text-xs text-muted-foreground w-28 text-right font-mono">
                    ₦{totalSaved.toLocaleString()} saved
                  </span>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Goals Table */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="all">All ({total})</TabsTrigger>
            <TabsTrigger value="active">Active ({active})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({completed})</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled ({cancelled})</TabsTrigger>
          </TabsList>
          <TabsContent value="all">
            <Card className="rounded-xl border shadow-sm">
              <GoalTable data={baskets} />
            </Card>
          </TabsContent>
          <TabsContent value="active">
            <Card className="rounded-xl border shadow-sm">
              <GoalTable data={baskets.filter((b) => b.status === "ACTIVE")} />
            </Card>
          </TabsContent>
          <TabsContent value="completed">
            <Card className="rounded-xl border shadow-sm">
              <GoalTable data={baskets.filter((b) => b.status === "COMPLETED")} />
            </Card>
          </TabsContent>
          <TabsContent value="cancelled">
            <Card className="rounded-xl border shadow-sm">
              <GoalTable data={baskets.filter((b) => b.status === "CANCELLED")} />
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}

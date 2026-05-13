import { prisma } from "@chowvest/database";
import {
  Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList,
  BreadcrumbPage, BreadcrumbSeparator,
} from "@chowvest/ui";
import { Separator } from "@chowvest/ui";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@chowvest/ui";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@chowvest/ui";
import { Badge } from "@chowvest/ui";
import Link from "next/link";
import { AlertCircle, ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { SearchBar } from "@/components/search-bar";
import { OverviewCharts } from "./overview-charts";

export default async function AdminDashboardPage() {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const [
    totalUsers,
    activeDeliveries,
    totalWalletBalanceData,
    totalGoals,
    completedGoals,
    platformFeesData,
    recentTransactions,
    newUsersRaw,
    goalsByCommodityRaw,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.delivery.count({
      where: { status: { in: ["PENDING", "CONFIRMED", "PREPARING", "IN_TRANSIT"] } },
    }),
    prisma.wallet.aggregate({ _sum: { balance: true } }),
    prisma.basket.count(),
    prisma.basket.count({ where: { status: "COMPLETED" } }),
    prisma.transaction.aggregate({
      _sum: { fee: true },
      where: { status: "COMPLETED", fee: { not: null } },
    }),
    prisma.transaction.findMany({
      where: { status: "COMPLETED" },
      orderBy: { completedAt: "desc" },
      take: 6,
      include: { user: { select: { fullName: true } } },
    }),
    // Signups per day for last 7 days
    prisma.$queryRaw<{ day: Date; count: bigint }[]>`
      SELECT DATE_TRUNC('day', "createdAt") as day, COUNT(*) as count
      FROM users
      WHERE "createdAt" >= ${sevenDaysAgo}
      GROUP BY day
      ORDER BY day ASC
    `,
    // Active goals grouped by commodityType
    prisma.basket.groupBy({
      by: ["commodityType"],
      where: { status: "ACTIVE" },
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 6,
    }),
  ]);

  const totalWalletBalance = Number(totalWalletBalanceData._sum.balance || 0);
  const totalFees = Number(platformFeesData._sum.fee || 0);

  // Serialize for client charts
  const signupData = newUsersRaw.map((r) => ({
    day: new Date(r.day).toLocaleDateString("en-NG", { weekday: "short", day: "numeric" }),
    count: Number(r.count),
  }));

  const commodityData = goalsByCommodityRaw.map((r) => ({
    name: r.commodityType || "Other",
    value: r._count.id,
  }));

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 border-b">
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
                <BreadcrumbPage>Overview</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">System Overview</h1>
          <p className="text-muted-foreground">High-level metrics for the Chowvest platform.</p>
        </div>

        {/* Stat Cards */}
        <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
          {[
            { label: "Total Users",        value: totalUsers.toLocaleString(),                  sub: "registered" },
            { label: "Active Deliveries",  value: activeDeliveries.toLocaleString(),             sub: "in-flight" },
            { label: "Wallet Volume",       value: `₦${totalWalletBalance.toLocaleString()}`,    sub: "total held" },
            { label: "Total Goals",         value: totalGoals.toLocaleString(),                  sub: "all time" },
            { label: "Completed Goals",     value: completedGoals.toLocaleString(),              sub: "fulfilled" },
            { label: "Platform Fees",       value: `₦${totalFees.toLocaleString()}`,             sub: "collected" },
          ].map(({ label, value, sub }) => (
            <div key={label} className="col-span-1 rounded-xl border bg-card text-card-foreground shadow-sm p-5">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide truncate">{label}</p>
              <p className="mt-1 text-2xl font-bold truncate">{value}</p>
              <p className="text-xs text-muted-foreground">{sub}</p>
            </div>
          ))}
        </div>

        {/* Charts */}
        <OverviewCharts signupData={signupData} commodityData={commodityData} />

        {/* Recent Transactions */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent className="px-0 pt-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left font-medium">User</th>
                    <th className="px-6 py-3 text-left font-medium">Type</th>
                    <th className="px-6 py-3 text-left font-medium">Amount</th>
                    <th className="px-6 py-3 text-left font-medium">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {recentTransactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-muted/30">
                      <td className="px-6 py-3 font-medium">{tx.user?.fullName || "Unknown"}</td>
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-1.5">
                          {["DEPOSIT","CREDIT","REFUND","TRANSFER_FROM_BASKET"].includes(tx.type)
                            ? <ArrowDownLeft className="w-3.5 h-3.5 text-green-500" />
                            : <ArrowUpRight className="w-3.5 h-3.5 text-red-500" />}
                          <span className="capitalize text-xs">{tx.type.replace(/_/g, " ")}</span>
                        </div>
                      </td>
                      <td className="px-6 py-3 font-mono text-sm">₦{Number(tx.amount).toLocaleString()}</td>
                      <td className="px-6 py-3 text-muted-foreground text-xs whitespace-nowrap">
                        {tx.completedAt ? new Date(tx.completedAt).toLocaleString() : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

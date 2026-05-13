import { prisma } from "@chowvest/database";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@chowvest/ui";
import { Separator } from "@chowvest/ui";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Card } from "@chowvest/ui";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@chowvest/ui";
import { Badge } from "@chowvest/ui";
import Link from "next/link";
import { AlertCircle, ArrowDownLeft, ArrowUpRight, TrendingUp } from "lucide-react";
import { SearchBar } from "@/components/search-bar";

export default async function AdminFinancesPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const query = (await searchParams).q || "";

  const [transactions, webhooks, revenueAgg] = await Promise.all([
    prisma.transaction.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      where: query ? {
        OR: [
          { id: { contains: query, mode: "insensitive" } },
          { processorTransactionId: { contains: query, mode: "insensitive" } },
          { user: { email: { contains: query, mode: "insensitive" } } }
        ]
      } : undefined,
      include: {
        user: { select: { fullName: true, email: true } }
      }
    }),
    prisma.processedWebhook.findMany({
      orderBy: { processedAt: "desc" },
      take: 100,
    }),
    prisma.transaction.aggregate({
      _sum: { fee: true, processorFee: true },
      where: { status: "COMPLETED" },
    }),
  ]);

  const grossFees    = Number(revenueAgg._sum.fee || 0);
  const paystackCut  = Number(revenueAgg._sum.processorFee || 0);
  const netRevenue   = grossFees - paystackCut;


  const flaggedTransactions = transactions.filter(t => t.isFlagged);

  const statusBadgeClass: Record<string, string> = {
    PENDING:    "bg-yellow-100 text-yellow-800 border-yellow-200",
    PROCESSING: "bg-blue-100 text-blue-800 border-blue-200",
    COMPLETED:  "bg-green-100 text-green-800 border-green-200",
    FAILED:     "bg-red-100 text-red-800 border-red-200",
    CANCELLED:  "bg-gray-100 text-gray-800 border-gray-200",
    REVERSED:   "bg-orange-100 text-orange-800 border-orange-200",
  };

  // Reusable transaction table with Variance breakdown
  const renderTransactionTable = (txs: typeof transactions) => (
    <div className="overflow-x-auto w-full">
      <table className="w-full text-sm text-left">
        <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b">
          <tr>
            <th className="px-6 py-4 font-medium">Type & Ref</th>
            <th className="px-6 py-4 font-medium">User</th>
            <th className="px-6 py-4 font-medium">Principal</th>
            <th className="px-6 py-4 font-medium">Processing Fee</th>
            <th className="px-6 py-4 font-medium">Paystack Cut</th>
            <th className="px-6 py-4 font-medium text-right">Variance</th>
            <th className="px-6 py-4 font-medium">Timestamp</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {txs.map((tx) => (
            <tr key={tx.id} className="hover:bg-muted/30 transition-colors">
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  {["DEPOSIT", "CREDIT", "REFUND", "TRANSFER_FROM_BASKET"].includes(tx.type) ? (
                    <ArrowDownLeft className="w-4 h-4 text-green-500" />
                  ) : (
                    <ArrowUpRight className="w-4 h-4 text-red-500" />
                  )}
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">
                        {tx.type === "DELIVERY_FEE" ? "DELIVERY FEE" : tx.type.replace(/_/g, ' ')}
                      </span>
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${statusBadgeClass[tx.status] ?? "bg-gray-100 text-gray-700 border-gray-200"}`}>
                        {tx.status}
                      </span>
                    </div>
                    <span className="text-xs font-mono text-muted-foreground">ID: {tx.id.split("-").pop() || tx.id.slice(0, 8)}</span>
                    {tx.processorTransactionId && (
                      <span className="text-[10px] text-muted-foreground font-mono">EXT: {tx.processorTransactionId}</span>
                    )}
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <Link href={`/users/${tx.userId}`} className="text-primary hover:underline font-medium block">
                  {tx.user?.fullName || "User"}
                </Link>
                <div className="text-xs text-muted-foreground">{tx.user?.email || "Unknown"}</div>
              </td>
              <td className="px-6 py-4 font-mono font-medium">
                {["FEE", "DELIVERY_FEE"].includes(tx.type) && !tx.fee
                  ? `₦${(Number(tx.amount) - 100).toLocaleString()}`
                  : `₦${Number(tx.amount).toLocaleString()}`}
              </td>
              <td className="px-6 py-4 font-mono text-muted-foreground">
                <div className="flex flex-col gap-1">
                  <span>
                    ₦{["FEE", "DELIVERY_FEE"].includes(tx.type) && !tx.fee
                      ? "100"
                      : Number(tx.fee || 0).toLocaleString()}
                  </span>
                  <span className="text-[10px] uppercase font-semibold text-primary/70">
                    {(tx.metadata as any)?.feeType || (tx.type === "DEPOSIT" ? "Processing Fee" : "Service Fee")}
                  </span>
                </div>
              </td>
              <td className="px-6 py-4 font-mono text-muted-foreground">
                ₦{Number(tx.processorFee || 0).toLocaleString()}
              </td>
              <td className="px-6 py-4 font-mono font-bold text-right">
                {(() => {
                   let feeVal = Number(tx.fee || 0);
                   if (["FEE", "DELIVERY_FEE"].includes(tx.type) && !tx.fee) feeVal = 100;

                   const variance = feeVal - Number(tx.processorFee || 0);
                   if (variance > 0) return <span className="text-green-600">+₦{variance.toLocaleString()}</span>;
                   if (variance < 0) return <span className="text-red-500">-₦{Math.abs(variance).toLocaleString()}</span>;
                   return <span className="text-muted-foreground">₦0</span>;
                })()}
              </td>
              <td className="px-6 py-4 text-muted-foreground text-xs whitespace-nowrap">
                {new Date(tx.createdAt).toLocaleString()}
              </td>
            </tr>
          ))}
          {txs.length === 0 && (
            <tr>
              <td colSpan={7} className="px-6 py-8 text-center text-muted-foreground border-dashed border">
                No transactions match criteria.
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
                <BreadcrumbPage>Financial Oversight</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">System Finances & Webhooks</h1>
            <p className="text-muted-foreground">Monitor platform liquidity and external processor reliability.</p>
          </div>
          <div className="flex items-center gap-4">
            <SearchBar placeholder="Search Ref, Event ID, or Email..." />
            {flaggedTransactions.length > 0 && (
               <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-semibold">
                 <AlertCircle className="w-4 h-4" />
                 {flaggedTransactions.length} Flagged Detected!
               </div>
            )}
          </div>
        </div>

        {/* Revenue Summary Cards */}
        <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
          <div className="rounded-xl border bg-card shadow-sm p-5">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Gross Collected Fees</p>
            <p className="text-2xl font-bold mt-1 font-mono">₦{grossFees.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">All platform fees, all time</p>
          </div>
          <div className="rounded-xl border bg-card shadow-sm p-5">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Paystack Cut</p>
            <p className="text-2xl font-bold mt-1 font-mono text-red-500">₦{paystackCut.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">Processor fees paid out</p>
          </div>
          <div className="rounded-xl border bg-green-500/10 border-green-500/20 shadow-sm p-5">
            <p className="text-xs text-green-700 font-medium uppercase tracking-wide flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> Variance
            </p>
            <p className="text-2xl font-bold mt-1 font-mono text-green-600">₦{netRevenue.toLocaleString()}</p>
            <p className="text-xs text-green-700/70 mt-1">After processor deductions</p>
          </div>
        </div>

        <Tabs defaultValue="all_tx" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="all_tx">All Transactions</TabsTrigger>
            <TabsTrigger value="flagged_tx">Flagged Transactions</TabsTrigger>
            <TabsTrigger value="webhooks">Processed Webhooks</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all_tx">
            <Card className="rounded-xl border shadow-sm">
              {renderTransactionTable(transactions)}
            </Card>
          </TabsContent>

          <TabsContent value="flagged_tx">
            <Card className="rounded-xl border shadow-sm">
              {renderTransactionTable(flaggedTransactions)}
            </Card>
          </TabsContent>

          {/* Webhooks Viewer */}
          <TabsContent value="webhooks">
            <Card className="rounded-xl border shadow-sm">
              <div className="overflow-x-auto w-full">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b">
                    <tr>
                      <th className="px-6 py-4 font-medium">Event ID (Unique)</th>
                      <th className="px-6 py-4 font-medium">Event Type</th>
                      <th className="px-6 py-4 font-medium">External Reference</th>
                      <th className="px-6 py-4 font-medium">Processed At</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {webhooks.map((wh) => (
                      <tr key={wh.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-6 py-4 font-mono text-xs">{wh.eventId}</td>
                        <td className="px-6 py-4">
                          <Badge variant="secondary" className="font-mono">{wh.eventType}</Badge>
                        </td>
                        <td className="px-6 py-4 font-mono text-xs text-muted-foreground">
                          {wh.reference || "N/A"}
                        </td>
                        <td className="px-6 py-4 text-muted-foreground text-xs whitespace-nowrap">
                          {new Date(wh.processedAt).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                    {webhooks.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground border-dashed border">
                          No webhooks have been processed by the system yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}

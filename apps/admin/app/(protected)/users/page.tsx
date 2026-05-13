import { prisma } from "@chowvest/database";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@chowvest/ui";
import { Separator } from "@chowvest/ui";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Card } from "@chowvest/ui";
import Link from "next/link";
import { Badge } from "@chowvest/ui";
import { SearchBar } from "@/components/search-bar";

export default async function AdminUsersPage({ searchParams }: { searchParams: Promise<{ q?: string, tab?: string }> }) {
  const query = (await searchParams).q || "";
  const tab = (await searchParams).tab || "all";
  
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    where: {
      AND: [
        query ? {
          OR: [
            { email: { contains: query, mode: "insensitive" } },
            { fullName: { contains: query, mode: "insensitive" } },
            { phoneNumber: { contains: query, mode: "insensitive" } }
          ]
        } : {},
        tab === "active" ? {
          accountStatus: "active",
          OR: [
            { sessions: { some: { createdAt: { gte: thirtyDaysAgo } } } },
            { transactions: { some: { createdAt: { gte: thirtyDaysAgo } } } },
            { baskets: { some: { updatedAt: { gte: thirtyDaysAgo } } } }
          ]
        } : {}
      ]
    },
    include: {
      wallet: { select: { balance: true } }
    }
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
                <BreadcrumbPage>Users Directory</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {tab === "active" ? "Active Users" : "Users Directory"}
            </h1>
            <p className="text-muted-foreground">
              {tab === "active" 
                ? "Manage users with active accounts." 
                : "Manage and view all registered users."}
            </p>
          </div>
          <SearchBar placeholder="Search name or email..." />
        </div>

        <Card className="rounded-xl border shadow-sm">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b">
                <tr>
                  <th className="px-6 py-4 font-medium">User / Email</th>
                  <th className="px-6 py-4 font-medium">Status & KYC</th>
                  <th className="px-6 py-4 font-medium">Wallet Balance</th>
                  <th className="px-6 py-4 font-medium">Joined</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-foreground">{user.fullName || "N/A"}</div>
                      <div className="text-xs text-muted-foreground">{user.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1 items-start">
                        {user.accountStatus === "suspended" ? (
                          <Badge variant="destructive" className="h-5 text-[10px]">Suspended</Badge>
                        ) : (
                          <Badge variant="default" className="bg-green-600 hover:bg-green-600 h-5 text-[10px]">Active</Badge>
                        )}
                        {user.emailVerified ? (
                          <Badge variant="secondary" className="h-5 text-[10px]">Email Verified</Badge>
                        ) : (
                          <Badge variant="outline" className="h-5 text-[10px] text-muted-foreground">Pending Email</Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium">
                      ₦{user.wallet ? Number(user.wallet.balance).toLocaleString() : "0"}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link 
                        href={`/users/${user.id}`} 
                        className="text-primary font-medium hover:underline text-sm"
                      >
                        View Details →
                      </Link>
                    </td>
                  </tr>
                ))}
                
                {users.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </>
  );
}

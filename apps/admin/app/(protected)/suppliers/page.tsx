import { prisma } from "@chowvest/database";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@chowvest/ui";
import { Separator } from "@chowvest/ui";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Card } from "@chowvest/ui";
import { Badge } from "@chowvest/ui";
import { SearchBar } from "@/components/search-bar";
import { AddSupplierDialog } from "./add-supplier-dialog";
import { MapPin, Phone } from "lucide-react";

export default async function SuppliersPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const query = (await searchParams).q || "";

  const suppliers = await prisma.supplier.findMany({
    orderBy: { createdAt: "desc" },
    where: {
      AND: [
        query ? {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { location: { contains: query, mode: "insensitive" } },
            { phoneNumber: { contains: query, mode: "insensitive" } }
          ]
        } : {},
      ]
    },
    include: {
      _count: {
        select: { commodities: true }
      }
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
                <BreadcrumbPage>Suppliers</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Suppliers</h1>
            <p className="text-muted-foreground">
              Manage your suppliers and their pickup locations.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <SearchBar placeholder="Search name or location..." />
            <AddSupplierDialog />
          </div>
        </div>

        <Card className="rounded-xl border shadow-sm">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b">
                <tr>
                  <th className="px-6 py-4 font-medium">Supplier Name</th>
                  <th className="px-6 py-4 font-medium">Contact & Location</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Linked Commodities</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {suppliers.map((supplier) => (
                  <tr key={supplier.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-foreground">{supplier.name}</div>
                      <div className="text-xs text-muted-foreground">Added {new Date(supplier.createdAt).toLocaleDateString()}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1 text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Phone className="w-3 h-3" />
                          <span>{supplier.phoneNumber}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3 h-3" />
                          <span>{supplier.location}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {supplier.isActive ? (
                        <Badge variant="default" className="bg-green-600 hover:bg-green-600 h-5 text-[10px]">Active</Badge>
                      ) : (
                        <Badge variant="secondary" className="h-5 text-[10px]">Inactive</Badge>
                      )}
                    </td>
                    <td className="px-6 py-4 font-medium text-muted-foreground">
                      {supplier._count.commodities} items
                    </td>
                    <td className="px-6 py-4 text-right">
                      {/* Placeholder for future edit action */}
                      <span className="text-muted-foreground text-xs">Edit</span>
                    </td>
                  </tr>
                ))}
                
                {suppliers.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                      No suppliers found. Click "Add Supplier" to create one.
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

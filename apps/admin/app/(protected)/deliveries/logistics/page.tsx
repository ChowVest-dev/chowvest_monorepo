import { prisma } from "@chowvest/database";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Badge, Separator, Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@chowvest/ui";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Truck, Users, MapPin, Mail, Phone, Calendar } from "lucide-react";
import { format } from "date-fns";

export default async function LogisticsPage() {
  const companies = await prisma.logisticsCompany.findMany({
    include: {
      _count: {
        select: {
          riders: true,
          deliveries: true,
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
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
                <BreadcrumbLink href="/deliveries">Deliveries</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Logistics Partners</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-primary">Logistics Partners</h2>
            <p className="text-muted-foreground">Manage and monitor your 3PL fleet network.</p>
          </div>
        </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Partners</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{companies.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Riders</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {companies.reduce((acc, c) => acc + c._count.riders, 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 grid-cols-1">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Registered Fleet Companies</CardTitle>
            <CardDescription>
              Manage and monitor your 3PL logistics partners.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {companies.map((company) => (
                <div 
                  key={company.id} 
                  className="flex items-center justify-between p-4 border rounded-xl hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                      <Truck className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{company.name}</h3>
                      <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3" /> {company.email}
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3" /> {company.phoneNumber}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-8">
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">Riders</p>
                      <p className="font-bold">{company._count.riders}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">Deliveries</p>
                      <p className="font-bold">{company._count.deliveries}</p>
                    </div>
                    <div className="text-right min-w-[120px]">
                      <Badge variant={company.isActive ? "default" : "destructive"}>
                        {company.isActive ? "Active" : "Suspended"}
                      </Badge>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        Joined {format(new Date(company.createdAt), 'MMM d, yyyy')}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              {companies.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  No logistics companies registered yet.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
    </>
  );
}

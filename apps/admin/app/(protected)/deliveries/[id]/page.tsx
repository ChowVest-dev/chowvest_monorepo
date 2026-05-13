import { prisma } from "@chowvest/database";
import { Breadcrumb, Button, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@chowvest/ui";
import { Separator } from "@chowvest/ui";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@chowvest/ui";
import { Badge } from "@chowvest/ui";
import { notFound } from "next/navigation";
import { DeliveryStatusChanger } from "../client-components";
import { MapPin, Phone, User, Package, Clock, Truck, FileText } from "lucide-react";
import Link from "next/link";

export default async function AdminDeliveryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  
  const delivery = await prisma.delivery.findUnique({
    where: { id: resolvedParams.id },
    include: {
      basket: true,
      logisticsCompany: true,
      rider: true,
      user: {
        select: { fullName: true, email: true, phoneNumber: true }
      }
    }
  });

  if (!delivery) return notFound();

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
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/deliveries">Deliveries</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Order #{delivery.id.slice(-6)}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8 max-w-5xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">Delivery Order Tracker</h1>
            <div className="flex gap-2 items-center">
              <span className="font-mono text-sm text-muted-foreground bg-muted px-2 py-1 rounded">ID: {delivery.id}</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm text-muted-foreground font-medium mr-2">Override Phase:</span>
            <DeliveryStatusChanger deliveryId={delivery.id} currentStatus={delivery.status} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Order Details */}
          <Card>
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-lg flex items-center gap-2">
                <Package className="w-5 h-5 text-primary" /> Delivery Info
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Type</span>
                <Badge variant="secondary">{delivery.deliveryType}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Option</span>
                <span className="font-medium">{delivery.deliveryOption}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Commodity</span>
                <span className="font-semibold">{delivery.basket?.name || "Multiple Items"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Delivery Fee</span>
                <span className="font-medium">₦{Number(delivery.deliveryFee).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Service Fee</span>
                <span className="font-medium">₦{Number(delivery.serviceFee).toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>

          {/* Customer & Destination */}
          <Card>
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-lg flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" /> Recipient & Destination
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div className="flex justify-between items-center group">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Customer</span>
                </div>
                <Link href={`/users/${delivery.userId}`} className="font-medium text-primary hover:underline">
                  {delivery.user.fullName || delivery.user.email}
                </Link>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Phone</span>
                </div>
                <span className="font-medium">{delivery.user.phoneNumber || "N/A"}</span>
              </div>
              <div className="border border-dashed p-3 rounded-lg mt-4 bg-muted/20">
                <div className="font-semibold text-sm mb-1">{delivery.addressLabel || "Drop-off Address"}</div>
                <div className="text-sm text-muted-foreground leading-relaxed">{delivery.address}</div>
              </div>
              {delivery.deliveryNote && (
                <div className="bg-primary/5 p-3 rounded-lg border border-primary/20 flex gap-2">
                  <FileText className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <span className="font-semibold block mb-0.5">Note from User:</span>
                    <span className="italic">{delivery.deliveryNote}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Dispatch/Fleet Info */}
          <Card className="border-none shadow-sm overflow-hidden">
            <CardHeader className="pb-3 border-b bg-muted/20">
              <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                <Truck className="w-4 h-4 text-primary" /> Logistics Partner
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              {delivery.logisticsCompany ? (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center font-bold text-primary">
                        {delivery.logisticsCompany.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-lg leading-none mb-1">{delivery.logisticsCompany.name}</p>
                        <p className="text-xs text-muted-foreground">{delivery.logisticsCompany.email}</p>
                      </div>
                    </div>
                  </div>

                  {delivery.rider ? (
                    <div className="bg-muted/30 rounded-3xl p-5 space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-wider mb-1">Rider Assigned</p>
                          <p className="font-bold">{delivery.rider.fullName}</p>
                        </div>
                        <Button size="icon" variant="secondary" className="rounded-xl h-10 w-10" asChild>
                          <a href={`tel:${delivery.rider.phoneNumber}`}><Phone className="w-4 h-4" /></a>
                        </Button>
                      </div>
                      <div className="flex justify-between items-center pt-4 border-t border-muted">
                        <span className="text-xs font-bold text-muted-foreground">Handshake PIN</span>
                        <span className="font-mono text-sm tracking-widest bg-white border px-3 py-1 rounded-full shadow-sm">
                          {delivery.deliveryPin || "••••"}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl flex items-center gap-3">
                      <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
                      <p className="text-xs text-amber-700 font-bold uppercase tracking-tight">Awaiting Rider Assignment</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-10 px-6 border-2 border-dashed rounded-[32px] space-y-3">
                  <div className="w-12 h-12 bg-muted rounded-full mx-auto flex items-center justify-center opacity-40">
                    <Truck className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">No Partner Assigned</p>
                  <p className="text-xs text-muted-foreground">Go to the Deliveries list to assign a logistics company.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" /> Execution Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Requested At</span>
                <span className="font-medium">{new Date(delivery.requestedAt).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Confirmed At</span>
                <span className="font-medium">{delivery.confirmedAt ? new Date(delivery.confirmedAt).toLocaleString() : "-"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Dispatched At</span>
                <span className="font-medium">{delivery.dispatchedAt ? new Date(delivery.dispatchedAt).toLocaleString() : "-"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Delivered At</span>
                <span className="font-medium">{delivery.deliveredAt ? new Date(delivery.deliveredAt).toLocaleString() : "-"}</span>
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, Badge, Button, Separator } from "@chowvest/ui";
import { Bike, Package, AlertCircle, Clock, MapPin, LogOut, ChevronRight, Activity, Truck, User, RefreshCw } from "lucide-react";
import { AddRiderDialog } from "./AddRiderDialog";
import { AssignRiderDialog } from "./AssignRiderDialog";
import { logoutLogistics } from "../actions";

interface DashboardProps {
  company: any;
  riders: any[];
  pendingDeliveries: any[];
  ongoingDeliveries: any[];
  activeDeliveriesCount: number;
}

export default function DashboardClient({ company, riders, pendingDeliveries, ongoingDeliveries, activeDeliveriesCount }: DashboardProps) {
  const router = useRouter();
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshing(true);
      router.refresh();
      setLastUpdated(new Date());
      setTimeout(() => setRefreshing(false), 800);
    }, 15000);
    return () => clearInterval(interval);
  }, [router]);

  return (
    <div className="min-h-screen bg-muted/20 flex flex-col font-sans">
      {/* Header (Admin Style) */}
      <header className="bg-white border-b sticky top-0 z-50 px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
            <img src="/chowvest-logo-nobg.png" alt="Logo" className="w-5 h-5 object-contain" />
          </div>
          <div>
            <h1 className="font-bold text-sm uppercase tracking-tight leading-none">{company.name}</h1>
            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest mt-0.5">Logistics Partner</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            <RefreshCw className={`w-3 h-3 ${refreshing ? "animate-spin text-primary" : ""}`} />
            {refreshing ? "Updating..." : `Updated ${lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}`}
          </div>
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive font-semibold" onClick={() => logoutLogistics()}>
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-6 py-8 space-y-8">
        
        {/* Page Title Area */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
           <div>
             <h2 className="text-2xl font-bold tracking-tight">Fleet Dashboard</h2>
             <p className="text-sm text-muted-foreground">Manage your riders and monitor active deliveries.</p>
           </div>
           <AddRiderDialog />
        </div>

        {/* Stats Grid (Standard Cards) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Riders", val: riders.length, icon: Bike, color: "text-blue-600" },
            { label: "New Requests", val: pendingDeliveries.length, icon: Clock, color: "text-amber-600" },
            { label: "Active Trips", val: activeDeliveriesCount, icon: Truck, color: "text-primary" },
            { label: "Online Now", val: riders.filter(r => r.status === "ONLINE").length, icon: Activity, color: "text-green-600" },
          ].map((stat, i) => (
            <Card key={i} className="border-none shadow-sm bg-white">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                    <p className="text-2xl font-bold">{stat.val}</p>
                  </div>
                  <div className={`p-2 bg-muted/50 ${stat.color} rounded-lg`}>
                    <stat.icon className="w-5 h-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Main List: Ongoing Trips (Admin Style List) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2 px-1">
               <div className="w-2 h-2 bg-green-500 rounded-full"></div>
               <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Live Operations</h3>
            </div>
            
            <Card className="border-none shadow-sm bg-white overflow-hidden">
               <CardHeader className="bg-muted/30 border-b py-3 px-5">
                  <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                    <Activity className="w-4 h-4 text-primary" /> Ongoing Deliveries
                  </CardTitle>
               </CardHeader>
               <CardContent className="p-0">
                  <div className="divide-y">
                    {ongoingDeliveries.length > 0 ? ongoingDeliveries.map((delivery) => (
                      <div key={delivery.id} className="p-5 flex items-center justify-between hover:bg-muted/10 transition-colors">
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 bg-muted rounded-xl flex items-center justify-center font-bold text-xs text-muted-foreground">
                              #{delivery.id.slice(-4).toUpperCase()}
                           </div>
                           <div>
                              <p className="font-bold text-sm leading-none mb-1">To: {delivery.address}</p>
                              <div className="flex items-center gap-2">
                                 <Badge className="text-[9px] h-4 font-black uppercase rounded-full px-2" variant={
                                   delivery.status === "IN_TRANSIT" ? "default" : "secondary"
                                 }>
                                   {delivery.status.replace("_", " ")}
                                 </Badge>
                                 <span className="text-[10px] font-bold text-muted-foreground">
                                   Assigned to <span className="text-black">{delivery.rider?.fullName || "N/A"}</span>
                                 </span>
                              </div>
                           </div>
                        </div>
                        <div className="text-right">
                           <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none mb-1">Updated</p>
                           <p className="text-xs font-bold">{new Date(delivery.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                      </div>
                    )) : (
                      <div className="py-20 text-center text-muted-foreground">
                        <Package className="w-10 h-10 mx-auto mb-3 opacity-20" />
                        <p className="text-xs font-bold uppercase tracking-widest">No active assignments</p>
                      </div>
                    )}
                  </div>
               </CardContent>
            </Card>
          </div>

          {/* Sidebar: New Requests & Riders */}
          <div className="space-y-8">
            
            {/* New Assignments */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground px-1">New Assignments</h3>
              <div className="space-y-3">
                {pendingDeliveries.length > 0 ? pendingDeliveries.map((delivery) => (
                  <Card key={delivery.id} className="border-none shadow-sm bg-white">
                    <CardContent className="p-4 space-y-4">
                       <div className="flex justify-between items-start">
                          <span className="font-bold text-sm">Order #{delivery.id.slice(-4).toUpperCase()}</span>
                          <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50 text-[10px] font-bold">NEW</Badge>
                       </div>
                       <p className="text-xs text-muted-foreground flex items-center gap-2">
                         <MapPin className="w-3 h-3" /> {delivery.address}
                       </p>
                       <AssignRiderDialog deliveryId={delivery.id} riders={riders} />
                    </CardContent>
                  </Card>
                )) : (
                  <div className="bg-muted/30 rounded-xl p-6 text-center">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Queue Clear</p>
                  </div>
                )}
              </div>
            </div>

            {/* Fleet Sidebar */}
            <Card className="border-none shadow-sm bg-white overflow-hidden">
              <CardHeader className="bg-muted/30 border-b py-3 px-5">
                <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                  <User className="w-4 h-4 text-primary" /> Fleet Hub
                </CardTitle>
              </CardHeader>
              <CardContent className="p-2 pt-4">
                <div className="space-y-1">
                  {riders.length > 0 ? riders.map((rider) => (
                    <div key={rider.id} className="p-3 rounded-xl hover:bg-muted/30 transition-colors flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center font-bold text-primary text-xs">
                          {rider.fullName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-xs leading-none mb-1">{rider.fullName}</p>
                          <p className="text-[9px] text-muted-foreground font-bold uppercase">{rider.phoneNumber}</p>
                        </div>
                      </div>
                      <div className={`w-2 h-2 rounded-full ${rider.status === "ONLINE" ? "bg-green-500" : "bg-muted"}`}></div>
                    </div>
                  )) : (
                    <p className="text-center py-4 text-xs font-bold text-muted-foreground">No Riders Added</p>
                  )}
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      </main>
    </div>
  );
}

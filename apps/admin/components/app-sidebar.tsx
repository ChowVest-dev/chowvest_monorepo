"use client"

import * as React from "react"
import { usePathname, useSearchParams } from "next/navigation"
import {
  Bot,
  GalleryVerticalEnd,
  Map,
  PieChart,
  Settings2,
  ShoppingBasket,
  Store,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar"

export function AppSidebar({ admin, ...props }: React.ComponentProps<typeof Sidebar> & { admin?: any }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const adminUser = {
    name: admin?.name || "Admin",
    email: admin?.email || "admin@chowvest.com",
    avatar: "",
  }

  const currentUrl = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : "")

  const navItems = [
    {
      title: "Overview",
      url: "/",
      icon: PieChart,
      isActive: pathname === "/",
    },
    {
      title: "Users",
      url: "/users",
      icon: Bot,
      isActive: pathname.startsWith("/users"),
      items: [
        { title: "All Users", url: "/users?tab=all" },
        { title: "Active Users", url: "/users?tab=active" },
      ],
    },
    {
      title: "Goals",
      url: "/goals",
      icon: ShoppingBasket,
      isActive: pathname.startsWith("/goals"),
    },
    {
      title: "Deliveries",
      url: "/deliveries",
      icon: Map,
      isActive: pathname.startsWith("/deliveries"),
      items: [
        { title: "Active Deliveries", url: "/deliveries" },
        { title: "Logistics Partners", url: "/deliveries/logistics" },
      ],
    },
    {
      title: "Finances",
      url: "/finances",
      icon: GalleryVerticalEnd,
      isActive: pathname.startsWith("/finances"),
    },
    {
      title: "Market",
      url: "/market",
      icon: Store,
      isActive: pathname.startsWith("/market"),
      items: [
        { title: "Savings", url: "/market/savings" },
        { title: "Marketplace", url: "/market/marketplace" },
      ],
    },
    {
      title: "Settings",
      url: "/settings",
      icon: Settings2,
      isActive: pathname.startsWith("/settings"),
    },
  ]

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="py-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="/">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg overflow-hidden bg-white">
                  <img src="/chowvest-logo.jpeg" alt="Chowvest Logo" className="w-full h-full object-cover" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold text-lg">Chowvest Admin</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItems} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={adminUser} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

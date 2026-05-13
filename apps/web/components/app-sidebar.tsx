"use client"

import * as React from "react"
import { usePathname, useSearchParams } from "next/navigation"
import {
  Bot,
  ChevronRight,
  GalleryVerticalEnd,
  Map,
  PieChart,
  Settings2,
  ShoppingBasket,
  Store,
  ShoppingCart,
  Sprout,
} from "lucide-react"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@chowvest/ui"

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
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "@chowvest/ui"

type NavItem =
  | { title: string; url: string; icon: React.ElementType; items?: never }
  | { title: string; url?: string; icon: React.ElementType; items: { title: string; url: string }[] }

const navigationItems: NavItem[] = [
  {
    title: "Overview",
    url: "/admin",
    icon: PieChart,
  },
  {
    title: "Users",
    icon: Bot,
    items: [
      { title: "All Users", url: "/admin/users?tab=all" },
      { title: "Active Users", url: "/admin/users?tab=active" },
    ],
  },
  {
    title: "Goals",
    url: "/admin/goals",
    icon: ShoppingBasket,
  },
  {
    title: "Deliveries",
    url: "/admin/deliveries",
    icon: Map,
  },
  {
    title: "Finances",
    url: "/admin/finances",
    icon: GalleryVerticalEnd,
  },
  {
    title: "Market",
    icon: Store,
    items: [
      { title: "Savings",     url: "/admin/market/savings" },
      { title: "Marketplace", url: "/admin/market/marketplace" },
    ],
  },
  {
    title: "Settings",
    url: "/admin/settings",
    icon: Settings2,
  },
]


export function AppSidebar({ admin, ...props }: React.ComponentProps<typeof Sidebar> & { admin?: any }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const adminUser = {
    name: admin?.name || "Admin",
    email: admin?.email || "admin@chowvest.com",
    avatar: "",
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="py-4">
        <div className="flex items-center gap-2 px-2">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
            <span className="font-bold text-primary">C</span>
          </div>
          <span className="font-bold text-lg group-data-[collapsible=icon]:hidden">Chowvest Admin</span>
        </div>
      </SidebarHeader>
      <SidebarContent className="px-2 mt-4 space-y-1">
        <SidebarMenu>
          {navigationItems.map((item) => {
            // ── Collapsible item (has sub-items) ──
            if (item.items) {
              const isOpen = item.items.some((sub) => pathname.startsWith(sub.url.split('?')[0]))
              return (
                <Collapsible key={item.title} defaultOpen={isOpen} className="group/collapsible">
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton tooltip={item.title}>
                        <item.icon className="w-4 h-4" />
                        <span>{item.title}</span>
                        <ChevronRight className="ml-auto w-4 h-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.items.map((sub) => {
                          const currentUrl = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '');
                          const isActive = sub.url === currentUrl || (sub.url === '/admin/users?tab=all' && currentUrl === '/admin/users');
                          
                          return (
                            <SidebarMenuSubItem key={sub.title}>
                              <SidebarMenuSubButton asChild isActive={isActive}>
                                <a href={sub.url}>
                                  <span>{sub.title}</span>
                                </a>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          );
                        })}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              )
            }

            // ── Regular flat item ──
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild tooltip={item.title} isActive={pathname === item.url}>
                  <a href={item.url!}>
                    <item.icon className="w-4 h-4" />
                    <span>{item.title}</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={adminUser} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

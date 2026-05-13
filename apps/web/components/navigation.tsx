"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Wallet, Target, ShoppingBag, User, Leaf, Truck, Box, ShoppingBasket } from "lucide-react";
import { cn } from "@chowvest/shared";
import { InteractiveMenu } from "@chowvest/ui";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/wallet", label: "Wallet", icon: Wallet },
  { href: "/basket-goals", label: "My Basket", icon: ShoppingBasket },
  { href: "/market", label: "Market", icon: ShoppingBag },
  { href: "/profile", label: "Profile", icon: User },
];

export function Navigation({ activeDeliveryCount = 0 }: { activeDeliveryCount?: number }) {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:flex fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 flex items-center justify-center bg-accent rounded-full">
                <img src="/chowvest-logo-nobg.png" alt="Chowvest logo" className="w-10 h-10 object-contain" />
              </div>
              <span className="text-xl font-bold text-foreground">Chowvest</span>
            </Link>

            <div className="flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                const isBasket = item.href === "/basket-goals";
                const hasBadge = isBasket && activeDeliveryCount > 0;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-lg transition-colors relative",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="font-medium">{item.label}</span>
                    
                    {hasBadge && (
                      <span className="absolute -top-1 -right-1 flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 border-2 border-white flex items-center justify-center text-[8px] text-white font-bold">
                          {activeDeliveryCount}
                        </span>
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <InteractiveMenu 
        items={navItems} 
        accentColor="var(--primary)" 
        activeDeliveryCount={activeDeliveryCount}
      />
    </>
  );
}

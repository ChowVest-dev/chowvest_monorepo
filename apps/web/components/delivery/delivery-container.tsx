import Link from "next/link";
import type { ReactNode } from "react";
//import Image from "next/image";

interface DeliveryContainerProps {
  children: ReactNode;
  commodityName: string;
  mode?: "CHECKOUT" | "TRACKING";
}

export function DeliveryContainer({ children, commodityName, mode = "CHECKOUT" }: DeliveryContainerProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex">
      {/* Left side - Hero section */}
      <div className="hidden md:flex md:w-[55%] bg-gradient-to-br from-primary via-primary to-primary-foreground flex-col justify-between p-12">
        <Link href="/dashboard">
           <div className="flex items-center gap-3 mb-16">
            <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center">
              <img src="/chowvest-logo.jpeg" alt="Chowvest logo" className="w-12 h-12 objecdivontain" />
            </div>
            <span className="text-2xl font-bold text-primary-foreground">
              Chowvest
            </span>
          </div>
        </Link>

        <div className="space-y-8">
          <div>
            <h1 className="text-5xl font-bold text-primary-foreground mb-6 text-balance">
              {mode === "CHECKOUT" ? "Basket Ready! 🎉" : "On Request 🛵"}
            </h1>
            <p className="text-lg text-primary-foreground/80">
              {mode === "CHECKOUT" ? (
                <>
                  You've successfully reached your goal for <span className="font-bold text-accent">{commodityName}</span>. 
                  Now, just confirm your details and our riders will bring your foodstock right to your doorstep.
                </>
              ) : (
                <>
                  Your request for <span className="font-bold text-accent">{commodityName}</span> is confirmed. 
                  Track your delivery rider's progress right to your doorstep.
                </>
              )}
            </p>
          </div>

          <div className="space-y-6 pt-8">
            <div className="flex gap-4">
              <div className="w-14 h-14 bg-accent/20 rounded-full flex items-center justify-center shrink-0">
                <span className="text-accent text-2xl">📦</span>
              </div>
              <div>
                <h3 className="font-semibold text-primary-foreground text-lg">
                  Carefully Packaged
                </h3>
                <p className="text-sm text-primary-foreground/70">
                  Your foodstuff is securely handled by our verified partners.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-14 h-14 bg-accent/20 rounded-full flex items-center justify-center shrink-0">
                <span className="text-accent text-2xl">🛵</span>
              </div>
              <div>
                <h3 className="font-semibold text-primary-foreground text-lg">
                  Swift Delivery
                </h3>
                <p className="text-sm text-primary-foreground/70">
                  Track your rider in real-time as they approach your address.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-14 h-14 bg-accent/20 rounded-full flex items-center justify-center shrink-0">
                <span className="text-accent text-2xl">🎉</span>
              </div>
              <div>
                <h3 className="font-semibold text-primary-foreground text-lg">
                  Enjoy the Savings
                </h3>
                <p className="text-sm text-primary-foreground/70">
                  Celebrate reaching your goal and enjoy a fully stocked kitchen.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="text-primary-foreground/60 text-sm">© 2025 Chowvest. Reliable deliveries, every time.</div>
      </div>

      {/* Right side - Delivery form */}
      <div className="w-full md:w-[45%] bg-white flex flex-col h-screen overflow-hidden">
        {children}
      </div>
    </div>
  );
}

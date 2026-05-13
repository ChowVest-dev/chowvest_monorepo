import type { ReactNode } from "react";
import Image from "next/image";

export function AuthContainer({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex">
      {/* Left side - Hero section */}
      <div className="hidden md:flex md:w-[55%] bg-gradient-to-br from-primary via-primary to-primary-foreground flex-col justify-between p-12">
        <div>
           <div className="flex items-center gap-3 mb-16">
            <div className="w-14 h-14 flex items-center rounded-lg bg-accent justify-center">
              <Image src="/chowvest-logo-nobg.png" width={50} height={50} alt="Chowvest logo" className="w-14 h-14 object-contain" />
            </div> 
            <span className="text-2xl font-bold text-primary-foreground">
              Chowvest
            </span>
          </div>
        </div>

        <div className="space-y-8">
          <div>
            <h1 className="text-5xl font-bold text-primary-foreground mb-6 text-balance">
              Small Savings, Big Meals
            </h1>
            <p className="text-lg text-primary-foreground/80">
              Build a simple and reliable food savings plan. Restock your
              kitchen with ease and stay prepared—one little step at a time.
            </p>
          </div>

          <div className="space-y-6 pt-8">
            <div className="flex gap-4">
              <div className="w-14 h-14 bg-accent/20 rounded-full flex items-center justify-center shrink-0">
                <span className="text-accent text-2xl">🍽️</span>
              </div>
              <div>
                <h3 className="font-semibold text-primary-foreground text-lg">
                  Easy Food Savings
                </h3>
                <p className="text-sm text-primary-foreground/70">
                  Set aside small amounts toward your next food restock.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-14 h-14 bg-accent/20 rounded-full flex items-center justify-center shrink-0">
                <span className="text-accent text-2xl">💰</span>
              </div>
              <div>
                <h3 className="font-semibold text-primary-foreground text-lg">
                  Transparent & Flexible
                </h3>
                <p className="text-sm text-primary-foreground/70">
                  Save at your own pace with clear, simple tracking.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-14 h-14 bg-accent/20 rounded-full flex items-center justify-center shrink-0">
                <span className="text-accent text-2xl">🌱</span>
              </div>
              <div>
                <h3 className="font-semibold text-primary-foreground text-lg">
                  Stay Consistent
                </h3>
                <p className="text-sm text-primary-foreground/70">
                  Make food planning easier and stress-free.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="text-primary-foreground/60 text-sm">© 2025 Chowvest. Your kitchen, always stocked.</div>
      </div>

      {/* Right side - Auth form */}
      <div className="w-full md:w-[45%]  flex items-center justify-center px-3 border">
        {children}
      </div>
    </div>
  );
}
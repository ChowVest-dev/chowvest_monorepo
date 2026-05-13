import Link from "next/link";
import { Button } from "@chowvest/ui";
import { ArrowRight, Truck, Bike } from "lucide-react";

export default function RidersLandingPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-accent rounded-2xl mx-auto flex items-center justify-center mb-6">
            <img src="/chowvest-logo-nobg.png" alt="Chowvest logo" className="w-10 h-10 object-contain" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Chowvest Logistics</h1>
          <p className="text-muted-foreground">Select your portal to continue</p>
        </div>

        <div className="grid gap-4">
          <Link href="/logistics/login" className="block group">
            <div className="p-6 border rounded-xl hover:border-primary hover:bg-accent/10 transition-colors cursor-pointer flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                  <Truck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Logistics Company</h3>
                  <p className="text-sm text-muted-foreground">Manage your fleet and riders</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
          </Link>

          <Link href="/rider/login" className="block group">
            <div className="p-6 border rounded-xl hover:border-primary hover:bg-accent/10 transition-colors cursor-pointer flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                  <Bike className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Delivery Rider</h3>
                  <p className="text-sm text-muted-foreground">Log in to start delivering</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

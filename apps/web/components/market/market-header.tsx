import { ShoppingBag, Search } from "lucide-react"
import { Input } from "@chowvest/ui"

export function MarketHeader() {
  return (
    <div className="space-y-4" data-onboarding-id="market-header">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
          <ShoppingBag className="w-7 h-7 text-primary" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground text-balance">Market</h1>
            <span className="bg-primary/20 text-primary text-[10px] font-bold px-2 py-1 rounded-full border border-primary/30 uppercase tracking-tighter">Coming Soon</span>
          </div>
          <p className="text-muted-foreground mt-1">Browse and purchase foodstuffs and cash crops</p>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input placeholder="Search for commodities..." className="pl-10" />
      </div>
    </div>
  )
}

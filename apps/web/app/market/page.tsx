import { Navigation } from "@/components/navigation"
import { MarketHeader } from "@/components/market/market-header"
import { MarketFilters } from "@/components/market/market-filters"
import { ProductGrid } from "@/components/market/product-grid"
import { MarketStats } from "@/components/market/market-stats"

export default function MarketPage() {
  return (
    <>
      <Navigation />
      <div className="container mx-auto px-4 md:px-6 space-y-6 pt-4 md:pt-20 pb-24 md:pb-8 mt-2 md:mt-6">
        <MarketHeader />
        <MarketStats />
        <MarketFilters />
        <ProductGrid />
      </div>
    </>
  )
}

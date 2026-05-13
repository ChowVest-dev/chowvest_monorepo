import { Card } from "@chowvest/ui"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

const stats = [
  {
    commodity: "Rice (50kg)",
    price: 45000,
    change: 5.2,
    trend: "up",
  },
  {
    commodity: "Beans (100kg)",
    price: 85000,
    change: -2.1,
    trend: "down",
  },
  {
    commodity: "Maize (10kg)",
    price: 25000,
    change: 0,
    trend: "neutral",
  },
  {
    commodity: "Garri (50kg)",
    price: 35000,
    change: 3.8,
    trend: "up",
  },
]

export function MarketStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const TrendIcon = stat.trend === "up" ? TrendingUp : stat.trend === "down" ? TrendingDown : Minus
        const trendColor =
          stat.trend === "up" ? "text-primary" : stat.trend === "down" ? "text-destructive" : "text-muted-foreground"

        return (
          <Card key={stat.commodity} className="p-4 bg-gradient-to-br from-card to-accent/10">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">{stat.commodity}</p>
              <p className="text-2xl font-bold text-foreground">₦{stat.price.toLocaleString()}</p>
              <div className={`flex items-center gap-1 text-sm ${trendColor}`}>
                <TrendIcon className="w-4 h-4" />
                <span>
                  {stat.change > 0 ? "+" : ""}
                  {stat.change}%
                </span>
              </div>
            </div>
          </Card>
        )
      })}
    </div>
  )
}

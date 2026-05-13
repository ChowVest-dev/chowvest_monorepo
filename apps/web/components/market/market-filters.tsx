"use client"

import { Button } from "@chowvest/ui"

const categories = ["All", "Foodstuff", "Cash Crops", "Seeds", "Tubers"]

export function MarketFilters() {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2">
      {categories.map((category) => (
        <Button
          key={category}
          variant={category === "All" ? "default" : "outline"}
          size="sm"
          className="whitespace-nowrap"
        >
          {category}
        </Button>
      ))}
    </div>
  )
}

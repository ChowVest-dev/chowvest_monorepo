"use client";

import { useState, useEffect } from "react";
import { Card } from "@chowvest/ui";
import { Button } from "@chowvest/ui";
import { Badge } from "@chowvest/ui";
import { ShoppingCart, Heart } from "lucide-react";
import { SkeletonProductCard } from "@/components/loaders/skeleton-loaders";

const products = [
  {
    id: 1,
    name: "Premium Rice",
    description: "50kg bag of high-quality rice",
    price: 45000,
    image: "/rice.jpg",
    category: "Foodstuff",
    inStock: true,
    discount: 10,
  },
  {
    id: 2,
    name: "Brown Beans",
    description: "100kg sack of brown beans",
    price: 85000,
    image: "/beans.jpg",
    category: "Foodstuff",
    inStock: true,
  },
  {
    id: 4,
    name: "White Garri",
    description: "50kg bag of white garri",
    price: 35000,
    image: "/garri.jpg",
    category: "Foodstuff",
    inStock: true,
    discount: 5,
  },
];

export function ProductGrid() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate data loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <SkeletonProductCard key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Coming Soon Overlay */}
      <div className="absolute inset-0 z-20 bg-background/40 backdrop-blur-[4px] rounded-3xl flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-border/50">
        <div className="w-16 h-16 rounded-full bg-card shadow-xl flex items-center justify-center mb-4 animate-bounce">
          <ShoppingCart className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Marketplace Coming Soon</h2>
        <p className="text-muted-foreground max-w-sm">
          We&apos;re stocking up our warehouse with premium commodities! Soon you&apos;ll be able to buy directly with instant delivery.
        </p>
      </div>

      <div data-onboarding-id="market-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-40 grayscale-[0.5] pointer-events-none select-none">
      {products.map((product) => (
        <Card
          key={product.id}
          className="overflow-hidden group hover:shadow-xl transition-shadow"
        >
          <div className="relative">
            <img
              src={product.image || "/placeholder.svg"}
              alt={product.name}
              className="w-full h-48 object-cover bg-muted group-hover:scale-105 transition-transform"
            />
            {product.discount && (
              <Badge className="absolute top-3 right-3 bg-destructive text-destructive-foreground">
                -{product.discount}%
              </Badge>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-3 left-3 bg-card/80 backdrop-blur-sm hover:bg-card"
            >
              <Heart className="w-5 h-5" />
            </Button>
          </div>

          <div className="p-5 space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-semibold text-foreground">
                  {product.name}
                </h3>
                <Badge variant="secondary" className="text-xs">
                  {product.category}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {product.description}
              </p>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-border">
              <div>
                {product.discount ? (
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground line-through">
                      ₦{product.price.toLocaleString()}
                    </p>
                    <p className="text-xl font-bold text-foreground">
                      ₦
                      {(
                        (product.price * (100 - product.discount)) /
                        100
                      ).toLocaleString()}
                    </p>
                  </div>
                ) : (
                  <p className="text-xl font-bold text-foreground">
                    ₦{product.price.toLocaleString()}
                  </p>
                )}
              </div>
              <Button disabled={!product.inStock} className="gap-2">
                <ShoppingCart className="w-4 h-4" />
                {product.inStock ? "Buy" : "Out of Stock"}
              </Button>
            </div>
          </div>
        </Card>
      ))}
      </div>
    </div>
  );
}

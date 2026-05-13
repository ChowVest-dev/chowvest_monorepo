import { Skeleton } from "@chowvest/ui";
import { SkeletonCard, SkeletonRow } from "./skeleton-loaders";

export function DeliveriesSkeleton() {
  return (
    <div className="container mx-auto px-4 md:px-6 space-y-6 pt-20 pb-24 md:pb-8">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-64" />
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <Skeleton className="h-9 w-24 rounded-full" />
        <Skeleton className="h-9 w-24 rounded-full" />
        <Skeleton className="h-9 w-24 rounded-full" />
      </div>

      {/* Delivery Cards */}
      <div className="space-y-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="rounded-xl border bg-card p-4 flex items-center gap-4"
          >
            <Skeleton className="w-16 h-16 rounded-xl shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-56" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

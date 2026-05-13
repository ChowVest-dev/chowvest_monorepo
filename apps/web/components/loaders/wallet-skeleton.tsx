import { Skeleton } from "@chowvest/ui";
import { SkeletonCard, SkeletonRow, SkeletonButton } from "./skeleton-loaders";

export function WalletSkeleton() {
  return (
    <div className="container mx-auto px-4 md:px-6 space-y-6 pt-20 pb-24 md:pb-8">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-4 w-64" />
      </div>

      {/* Balance Card */}
      <div className="rounded-lg border bg-card p-6 space-y-4">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-12 w-48" />
        <div className="flex gap-2 pt-2">
          <SkeletonButton className="flex-1" />
          <SkeletonButton className="flex-1" />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>

      {/* Transaction History */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-9 w-24 rounded-full" />
        </div>
        <div className="rounded-lg border bg-card divide-y">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="px-4">
              <SkeletonRow />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

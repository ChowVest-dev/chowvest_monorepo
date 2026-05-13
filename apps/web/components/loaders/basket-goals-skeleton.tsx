import { Skeleton } from "@chowvest/ui";
import { SkeletonGoalCard } from "./skeleton-loaders";

export function BasketGoalsSkeleton() {
  return (
    <div className="container mx-auto px-4 md:px-6 space-y-6 pt-20 pb-24 md:pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-32 rounded-md" />
      </div>

      {/* Create Goal Card */}
      <div className="rounded-lg border-2 border-dashed bg-card/50 p-8 flex flex-col items-center justify-center space-y-3">
        <Skeleton className="h-12 w-12 rounded-full" />
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-4 w-64" />
        <Skeleton className="h-10 w-40 rounded-md" />
      </div>

      {/* Goals Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <SkeletonGoalCard key={i} />
        ))}
      </div>
    </div>
  );
}

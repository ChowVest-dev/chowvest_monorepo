import {
  SkeletonHeader,
  SkeletonStat,
  SkeletonChart,
  SkeletonGoalCard,
} from "./skeleton-loaders";

export function DashboardSkeleton() {
  return (
    <div className="container mx-auto px-4 md:px-6 space-y-6 pt-20 pb-24 md:pb-8">
      {/* Header */}
      <SkeletonHeader />

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-3">
        <SkeletonStat />
        <SkeletonStat />
        <SkeletonStat />
      </div>

      {/* Chart */}
      <SkeletonChart />

      {/* Active Goals Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-6 w-32 bg-accent animate-pulse rounded-md" />
          <div className="h-9 w-24 bg-accent animate-pulse rounded-md" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <SkeletonGoalCard />
          <SkeletonGoalCard />
          <SkeletonGoalCard />
        </div>
      </div>
    </div>
  );
}

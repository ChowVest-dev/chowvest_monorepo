import { Skeleton } from "@chowvest/ui";
import { SkeletonAvatar, SkeletonInput } from "./skeleton-loaders";

export function ProfileSkeleton() {
  return (
    <div className="container mx-auto px-4 md:px-6 space-y-6 pt-20 pb-24 md:pb-8">
      {/* Profile Header */}
      <div className="rounded-lg border bg-card p-6 space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          <Skeleton className="h-24 w-24 rounded-full" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-64" />
            <div className="flex gap-2">
              <Skeleton className="h-9 w-32 rounded-md" />
              <Skeleton className="h-9 w-32 rounded-md" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="rounded-lg border bg-card p-6 space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-8 w-20" />
          </div>
        ))}
      </div>

      {/* Settings Form */}
      <div className="rounded-lg border bg-card p-6 space-y-6">
        <Skeleton className="h-6 w-40" />
        <div className="space-y-4">
          <SkeletonInput />
          <SkeletonInput />
          <SkeletonInput />
          <SkeletonInput />
        </div>
        <div className="flex justify-end gap-2">
          <Skeleton className="h-10 w-24 rounded-md" />
          <Skeleton className="h-10 w-32 rounded-md" />
        </div>
      </div>
    </div>
  );
}

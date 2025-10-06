import { Skeleton } from "@/app/_components/skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb Skeleton */}
        <div className="flex items-center gap-2 mb-6">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-2" />
          <Skeleton className="h-4 w-32" />
        </div>

        {/* Collection Header Skeleton */}
        <div className="bg-white rounded-xl p-6 mb-8 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-8 w-20" />
              </div>
              <Skeleton className="h-4 w-96 mb-4" />
              <div className="flex gap-6">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-4 w-24" />
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-20" />
              ))}
            </div>
          </div>
        </div>

        {/* Search Bar Skeleton */}
        <div className="mb-8">
          <div className="flex gap-4">
            <Skeleton className="h-12 w-full max-w-2xl" />
            <Skeleton className="h-10 w-20" />
            <Skeleton className="h-10 w-20" />
          </div>
        </div>

        {/* Collection Items Skeleton */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-6 w-16" />
          </div>
          <div className="text-center py-12">
            <Skeleton className="h-24 w-24 rounded-full mx-auto mb-4" />
            <Skeleton className="h-6 w-48 mx-auto mb-2" />
            <Skeleton className="h-4 w-80 mx-auto mb-6" />
            <div className="flex gap-4 justify-center">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-32" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

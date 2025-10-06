import { Skeleton } from "@/app/_components/skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Skeleton */}
        <div className="bg-gradient-to-r from-olive-50 to-slate-50 rounded-xl p-6 mb-6">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-80" />
        </div>

        {/* Search and Filters Skeleton */}
        <div className="mb-8">
          <div className="flex gap-4">
            <Skeleton className="h-12 w-full max-w-2xl" />
            <Skeleton className="h-10 w-20" />
          </div>
        </div>

        {/* Results Header Skeleton */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <Skeleton className="h-6 w-48 mb-2" />
            <Skeleton className="h-4 w-32" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>

        {/* Marketplace Cards Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-xl shadow-sm overflow-hidden"
            >
              <Skeleton className="aspect-[200/280] w-full" />
              <div className="p-4">
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-3 w-3/4 mb-2" />
                <Skeleton className="h-3 w-1/2 mb-3" />
                <Skeleton className="h-3 w-1/3 mb-3" />
                <div className="flex items-center justify-between">
                  <div>
                    <Skeleton className="h-6 w-16 mb-1" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                  <Skeleton className="h-8 w-16" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

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

        {/* Stats Summary Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-8 w-16" />
                </div>
                <Skeleton className="h-8 w-8 rounded-full" />
              </div>
            </div>
          ))}
        </div>

        {/* Tab Navigation Skeleton */}
        <div className="mb-8">
          <div className="flex gap-2">
            {Array.from({ length: 2 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-32 rounded-lg" />
            ))}
          </div>
        </div>

        {/* Deals List Skeleton */}
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div>
                    <Skeleton className="h-4 w-32 mb-1" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-20 rounded-full" />
                  <Skeleton className="h-8 w-8" />
                </div>
              </div>
              <div className="mb-4">
                <Skeleton className="h-3 w-24 mb-2" />
                <div className="flex gap-2">
                  {Array.from({ length: 3 }).map((_, j) => (
                    <Skeleton key={j} className="h-16 w-12" />
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-8 w-24" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

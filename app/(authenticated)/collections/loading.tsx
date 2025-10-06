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

        {/* Stats Bar Skeleton */}
        <div className="bg-white rounded-xl p-6 mb-8 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="text-center">
                <Skeleton className="h-8 w-16 mx-auto mb-2" />
                <Skeleton className="h-4 w-24 mx-auto" />
              </div>
            ))}
          </div>
        </div>

        {/* Filter Tabs Skeleton */}
        <div className="mb-8">
          <div className="flex gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-24 rounded-lg" />
            ))}
          </div>
        </div>

        {/* Collections Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-xl shadow-sm p-4 border border-slate-100"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

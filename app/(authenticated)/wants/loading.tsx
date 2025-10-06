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

        {/* Want Lists Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <Skeleton className="h-4 w-32 mb-1" />
                  <Skeleton className="h-3 w-48 mb-2" />
                </div>
                <Skeleton className="h-5 w-20 rounded-full" />
              </div>
              <div className="space-y-3">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
              <div className="mt-4 pt-4 border-t border-slate-200">
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

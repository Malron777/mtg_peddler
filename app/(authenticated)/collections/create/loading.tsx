import { Skeleton } from "@/app/_components/skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Skeleton */}
        <div className="flex items-center gap-4 mb-8">
          <Skeleton className="h-8 w-32" />
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-80" />
          </div>
        </div>

        {/* Progress Indicator Skeleton */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="ml-3">
                  <Skeleton className="h-4 w-16" />
                </div>
                {i < 3 && <Skeleton className="w-16 h-0.5 mx-4" />}
              </div>
            ))}
          </div>
        </div>

        {/* Form Content Skeleton */}
        <div className="bg-white rounded-xl p-8 shadow-sm">
          <div className="space-y-6">
            <div>
              <Skeleton className="h-6 w-48 mb-4" />
              <Skeleton className="h-4 w-96 mb-6" />
            </div>
            <div className="space-y-4">
              <div>
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div>
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-20 w-full" />
              </div>
              <div>
                <Skeleton className="h-4 w-24 mb-2" />
                <div className="space-y-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-6 w-full" />
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-between pt-8 border-t border-slate-200">
            <Skeleton className="h-10 w-20" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
      </div>
    </div>
  );
}

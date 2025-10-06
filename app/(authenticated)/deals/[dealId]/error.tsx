import { AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="max-w-md mx-auto text-center">
        <div className="bg-red-50 border border-red-200 rounded-xl p-8">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-red-900 mb-2">
            Deal Not Found
          </h1>
          <p className="text-red-700 mb-6">
            The deal you&apos;re looking for doesn&apos;t exist or you
            don&apos;t have permission to view it.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/deals">
              <button className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors">
                <ArrowLeft className="h-4 w-4" />
                Back to Deals
              </button>
            </Link>
            <button
              onClick={reset}
              className="px-4 py-2 border border-red-300 hover:border-red-400 text-red-700 rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

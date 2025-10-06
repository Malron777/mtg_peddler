import Link from "next/link";

export default function CollectionsPage() {
  return (
    <div className="flex flex-col items-center align-middle w-full p-8">
      <h1 className="text-3xl font-bold mb-8">Collections</h1>
      <p className="mb-8">Welcome to the Collections Page</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
        <Link
          href="/dashboard/collections/import"
          className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200 text-center"
        >
          <h2 className="text-xl font-semibold mb-2">Import Collections</h2>
          <p className="text-gray-600">Import your card collections</p>
        </Link>
      </div>
    </div>
  );
}

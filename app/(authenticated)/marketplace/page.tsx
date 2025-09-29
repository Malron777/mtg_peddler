import Link from "next/link";

export default function MarketplacePage() {
  return (
    <div className="flex flex-col items-center align-middle w-full p-8">
      <h1 className="text-3xl font-bold mb-8">Marketplace</h1>
      <p className="mb-8">Welcome to the Marketplace Page</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
        <Link
          href="/marketplace/promotions"
          className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200 text-center"
        >
          <h2 className="text-xl font-semibold mb-2">Promotions</h2>
          <p className="text-gray-600">View marketplace promotions</p>
        </Link>

        <Link
          href="/marketplace/search"
          className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200 text-center"
        >
          <h2 className="text-xl font-semibold mb-2">Search</h2>
          <p className="text-gray-600">Search for cards</p>
        </Link>

        <Link
          href="/marketplace/stores"
          className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200 text-center"
        >
          <h2 className="text-xl font-semibold mb-2">Stores</h2>
          <p className="text-gray-600">Browse marketplace stores</p>
        </Link>
      </div>
    </div>
  );
}

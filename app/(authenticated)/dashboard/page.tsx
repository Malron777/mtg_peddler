import Link from "next/link";

export default async function Dashboard() {
  return (
    <div className="flex flex-col items-center align-middle w-full p-8">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-6 w-full max-w-4xl">
        <Link
          href="/dashboard/collections"
          className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200 text-center"
        >
          <h2 className="text-xl font-semibold mb-2">Collections</h2>
          <p className="text-gray-600">Manage your card collections</p>
        </Link>

        <Link
          href="/marketplace"
          className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200 text-center"
        >
          <h2 className="text-xl font-semibold mb-2">Marketplace</h2>
          <p className="text-gray-600">Browse and buy cards</p>
        </Link>

        <Link
          href="/showcase"
          className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200 text-center"
        >
          <h2 className="text-xl font-semibold mb-2">Showcase</h2>
          <p className="text-gray-600">Display your collection</p>
        </Link>

        <Link
          href="/store"
          className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200 text-center"
        >
          <h2 className="text-xl font-semibold mb-2">Store</h2>
          <p className="text-gray-600">Manage your store</p>
        </Link>

        <Link
          href="/wants"
          className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200 text-center"
        >
          <h2 className="text-xl font-semibold mb-2">Wants</h2>
          <p className="text-gray-600">Track wanted cards</p>
        </Link>

        <Link
          href="/deals"
          className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200 text-center"
        >
          <h2 className="text-xl font-semibold mb-2">Deals</h2>
          <p className="text-gray-600">Manage your deals</p>
        </Link>
      </div>
    </div>
  );
}

import Link from "next/link";

export default function StorePage() {
  return (
    <div className="flex flex-col items-center align-middle w-full p-8">
      <h1 className="text-3xl font-bold mb-8">Store</h1>
      <p className="mb-8">Welcome to the Store Page</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
        <Link
          href="/store/analytics"
          className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200 text-center"
        >
          <h2 className="text-xl font-semibold mb-2">Analytics</h2>
          <p className="text-gray-600">View store analytics</p>
        </Link>

        <Link
          href="/store/inventory"
          className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200 text-center"
        >
          <h2 className="text-xl font-semibold mb-2">Inventory</h2>
          <p className="text-gray-600">Manage store inventory</p>
        </Link>

        <Link
          href="/store/promotions"
          className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200 text-center"
        >
          <h2 className="text-xl font-semibold mb-2">Promotions</h2>
          <p className="text-gray-600">Manage store promotions</p>
        </Link>
      </div>
    </div>
  );
}

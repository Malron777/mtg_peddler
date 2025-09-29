import Link from "next/link";

export default function ProfilePage() {
  return (
    <div className="flex flex-col items-center align-middle w-full p-8">
      <h1 className="text-3xl font-bold mb-8">Profile</h1>
      <p className="mb-8">Welcome to your Profile Page</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl mb-8">
        <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
          <h2 className="text-xl font-semibold mb-2">Settings</h2>
          <p className="text-gray-600">Manage your account settings</p>
        </div>

        <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
          <h2 className="text-xl font-semibold mb-2">Locations</h2>
          <p className="text-gray-600">Manage your locations</p>
        </div>

        <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
          <h2 className="text-xl font-semibold mb-2">Payment Methods</h2>
          <p className="text-gray-600">Manage your payment methods</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
        <Link
          href="/profile/analytics"
          className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200 text-center"
        >
          <h2 className="text-xl font-semibold mb-2">Analytics</h2>
          <p className="text-gray-600">View profile analytics</p>
        </Link>

        <Link
          href="/profile/settings"
          className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200 text-center"
        >
          <h2 className="text-xl font-semibold mb-2">Settings</h2>
          <p className="text-gray-600">Manage profile settings</p>
        </Link>
      </div>
    </div>
  );
}

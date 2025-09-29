import Link from "next/link";

export default function LogoutButton() {
  return (
    <Link href="/logout">
      <button className="bg-gray-500 p-2 rounded-lg m-2 text-black">
        Log out
      </button>
    </Link>
  );
}

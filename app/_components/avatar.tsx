import Link from "next/link";
import { useEffect, useState } from "react";
import { getCurrentUser } from "../auth-actions";

export default function Avatar() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    };
    fetchUser();
  }, []);

  return (
    <Link href="/profile">
      <div className="w-10 h-10 bg-gradient-to-br from-[var(--olive-400)] to-[var(--olive-600)] rounded-full flex items-center justify-center text-white font-bold text-sm hover:opacity-80 transition-opacity cursor-pointer">
        {user?.name?.charAt(0) || "U"}
      </div>
    </Link>
  );
}

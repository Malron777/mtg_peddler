"use client";

import { Button } from "@/components/ui/button";
import { Bell, Menu } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getCurrentUser } from "../auth-actions";
import Avatar from "./avatar";

export default function Navbar() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    };
    fetchUser();
  }, []);

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/hub" className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-[var(--olive-400)] to-[var(--olive-600)] rounded-lg flex items-center justify-center text-white font-bold text-lg">
              🍃
            </div>
            <span className="text-xl font-bold text-[var(--olive-700)]">
              TradeHub
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link
              href="/marketplace"
              className="text-[var(--slate-600)] hover:text-[var(--olive-600)] font-medium transition-colors"
            >
              Marketplace
            </Link>
            <Link
              href="/collections"
              className="text-[var(--slate-600)] hover:text-[var(--olive-600)] font-medium transition-colors"
            >
              Collections
            </Link>
            <Link
              href="/wants"
              className="text-[var(--slate-600)] hover:text-[var(--olive-600)] font-medium transition-colors"
            >
              Wants
            </Link>
            <Link
              href="/deals"
              className="text-[var(--slate-600)] hover:text-[var(--olive-600)] font-medium transition-colors"
            >
              Deals
            </Link>
            <Link
              href="/marketplace/stores"
              className="text-[var(--slate-600)] hover:text-[var(--olive-600)] font-medium transition-colors"
            >
              Stores
            </Link>
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <>
                <div className="relative">
                  <Bell className="w-5 h-5 text-[var(--slate-600)] hover:text-[var(--olive-600)] cursor-pointer transition-colors" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-[var(--error)] rounded-full"></div>
                </div>
                <Avatar />
                <Link href="/logout">
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-[var(--slate-800)] text-white border-none hover:bg-[var(--slate-700)] hover:text-white"
                  >
                    Logout
                  </Button>
                </Link>
              </>
            ) : (
              <div className="flex gap-2">
                <Link href="/sign-in">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-[var(--olive-200)] text-[var(--olive-600)] hover:bg-[var(--olive-50)]"
                  >
                    Sign In
                  </Button>
                </Link>
                <Link href="/sign-up">
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-[var(--olive-500)] to-[var(--olive-600)] hover:from-[var(--olive-600)] hover:to-[var(--olive-700)]"
                  >
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
            <button className="md:hidden">
              <Menu className="w-6 h-6 text-[var(--slate-600)]" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

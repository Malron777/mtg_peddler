"use client";

import { Button } from "@/components/ui/button";
import { User } from "better-auth";
import { Bell, Menu, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getCurrentUser } from "../auth-actions";
import Avatar from "./avatar";

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [hasNotifications, setHasNotifications] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    };
    fetchUser();

    // TODO: Replace with actual notification check
    // For now, set to false to hide the red dot
    setHasNotifications(false);
  }, []);

  return (
    <nav className="bg-gradient-to-r from-[var(--olive-100)] to-[var(--slate-100)] shadow-sm sticky top-0 z-50 border-b border-[var(--olive-200)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/hub" className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-[var(--olive-500)] to-[var(--olive-700)] rounded-md flex items-center justify-center text-white font-bold text-lg">
              🍃
            </div>
            <span className="text-xl font-bold text-[var(--olive-800)]">
              MTGPeddler
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link
              href="/marketplace"
              className="text-[var(--slate-700)] hover:text-[var(--olive-700)] font-medium transition-colors"
            >
              Marketplace
            </Link>
            <Link
              href="/collections"
              className="text-[var(--slate-700)] hover:text-[var(--olive-700)] font-medium transition-colors"
            >
              Collections
            </Link>
            <Link
              href="/wants"
              className="text-[var(--slate-700)] hover:text-[var(--olive-700)] font-medium transition-colors"
            >
              Wants
            </Link>
            <Link
              href="/deals"
              className="text-[var(--slate-700)] hover:text-[var(--olive-700)] font-medium transition-colors"
            >
              Deals
            </Link>
            <Link
              href="/marketplace/stores"
              className="text-[var(--slate-700)] hover:text-[var(--olive-700)] font-medium transition-colors"
            >
              Stores
            </Link>
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <>
                <div className="relative">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative p-2 rounded-md hover:bg-[var(--olive-50)] transition-colors"
                  >
                    <Bell className="w-5 h-5 text-[var(--slate-700)] hover:text-[var(--olive-700)] transition-colors" />
                    {hasNotifications && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-[var(--error)] rounded-full"></div>
                    )}
                  </button>

                  {/* Notifications Dropdown */}
                  {showNotifications && (
                    <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-md shadow-lg border border-[var(--slate-200)] z-50">
                      <div className="p-4 border-b border-[var(--slate-200)]">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-[var(--slate-800)]">
                            Notifications
                          </h3>
                          <button
                            onClick={() => setShowNotifications(false)}
                            className="p-1 hover:bg-[var(--slate-100)] rounded-md transition-colors"
                          >
                            <X className="w-4 h-4 text-[var(--slate-600)]" />
                          </button>
                        </div>
                      </div>
                      <div className="p-8 text-center">
                        <Bell className="w-12 h-12 text-[var(--slate-400)] mx-auto mb-3" />
                        <p className="text-[var(--slate-600)] font-medium">
                          No notifications
                        </p>
                        <p className="text-sm text-[var(--slate-500)] mt-1">
                          You&apos;re all caught up! New notifications will
                          appear here.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
                <Avatar />
                <Link href="/logout">
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-[var(--slate-800)] text-white border-none hover:bg-[var(--slate-700)] hover:text-white rounded-md"
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
                    className="border-[var(--olive-200)] text-[var(--olive-600)] hover:bg-[var(--olive-50)] rounded-md"
                  >
                    Sign In
                  </Button>
                </Link>
                <Link href="/sign-up">
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-[var(--olive-500)] to-[var(--olive-600)] hover:from-[var(--olive-600)] hover:to-[var(--olive-700)] rounded-md"
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

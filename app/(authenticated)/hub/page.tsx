"use client";

import MarketplaceSearchBar from "@/app/_components/marketplace-search-bar";
import {
  CompactQuickActions,
  FloatingActionButton,
} from "@/app/_components/quick-actions";
import { MarketplaceStats } from "@/app/_components/stats-cards";
import { getCurrentUser } from "@/app/auth-actions";
import {
  useGetManyCollectionsValue,
  useGetWantListMatches,
} from "@/app/lib/hooks/collection/use-collections.hook";
import { useGetActiveTradesCount } from "@/app/lib/hooks/deals/use-deals.hook";
import { useGetAllUserReportsForUser } from "@/app/lib/hooks/report/use-user-reports.hook";
import { useEffect, useState } from "react";

export default function HubPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [user, setUser] = useState<any>(null);

  // Hooks for data fetching
  const { count: activeTradesCount, getActiveTradesCount } =
    useGetActiveTradesCount();
  const { values: collectionValues, getManyCollectionsValue } =
    useGetManyCollectionsValue();
  const { matches: wantListMatches, getWantListMatches } =
    useGetWantListMatches();
  const { userReports, getAllUserReportsForUser } =
    useGetAllUserReportsForUser();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const currentUser = await getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
          // Fetch user-specific data
          await getActiveTradesCount({ userId: currentUser.id });
          await getAllUserReportsForUser(currentUser.id);
          await getWantListMatches({ userId: currentUser.id });
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, [getActiveTradesCount, getAllUserReportsForUser, getWantListMatches]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to marketplace search with query
      window.location.href = `/marketplace/search?q=${encodeURIComponent(
        searchQuery
      )}`;
    }
  };

  const completedDealsCount =
    userReports?.filter((report) => report.status === "completed").length || 0;
  const wantListMatchesCount = wantListMatches?.length || 0;
  const totalCollectionValue =
    collectionValues?.reduce(
      (sum: number, value: any) => sum + (value.totalValue || 0),
      0
    ) || 0;

  return (
    <div className="w-full">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-[var(--olive-600)] to-[var(--olive-800)] bg-clip-text text-transparent">
            Your Gateway to Smart Trading
          </h1>
          <p className="text-lg text-[var(--slate-600)] max-w-2xl mx-auto mb-8">
            Connect with thousands of traders, find the best deals, and manage
            your collection with confidence.
          </p>

          {/* Search Bar */}
          <MarketplaceSearchBar
            onSearch={(query) => {
              console.log("Searching for:", query);
            }}
            className="max-w-2xl mx-auto"
          />
        </div>

        {/* Stats Bar */}
        <MarketplaceStats
          activeTradesCount={activeTradesCount || 0}
          collectionValue={totalCollectionValue}
          completedDealsCount={completedDealsCount}
          wantListMatchesCount={wantListMatchesCount}
          className="mb-12"
        />

        {/* Quick Actions */}
        <CompactQuickActions className="mb-12" />

        {/* Mobile Navigation */}
        <FloatingActionButton />
      </div>
    </div>
  );
}

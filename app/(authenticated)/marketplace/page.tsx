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
import { Card, CardContent } from "@/components/ui/card";
import { useEffect, useState } from "react";

export default function MarketplacePage() {
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
            Marketplace
          </h1>
          <p className="text-lg text-[var(--slate-600)] max-w-2xl mx-auto mb-8">
            Discover cards from public collections, find the best deals, and
            connect with traders worldwide.
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

        {/* Featured Cards Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-[var(--slate-800)] mb-6 flex items-center gap-2">
            <div className="w-1 h-6 bg-[var(--olive-500)] rounded"></div>
            Featured Cards
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Sample Featured Cards */}
            <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer">
              <div className="relative">
                <div className="h-48 bg-gradient-to-br from-[var(--slate-200)] to-[var(--slate-300)] rounded-t-lg"></div>
                <div className="absolute top-3 right-3 px-3 py-1 bg-gradient-to-r from-[var(--rarity-mythic)] to-[var(--rarity-mythic)] text-white text-xs font-semibold rounded-full">
                  Mythic
                </div>
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold text-[var(--slate-800)] mb-1">
                  Ragavan, Nimble Pilferer
                </h3>
                <p className="text-sm text-[var(--slate-500)] mb-2">
                  Modern Horizons 2
                </p>
                <p className="text-xl font-bold text-[var(--olive-600)] mb-3">
                  $65.00
                </p>
                <div className="flex gap-2 flex-wrap">
                  <span className="px-2 py-1 bg-[var(--condition-nm)]/10 text-[var(--condition-nm)] text-xs rounded-md">
                    NM
                  </span>
                  <span className="px-2 py-1 bg-[var(--olive-100)] text-[var(--olive-700)] text-xs rounded-md">
                    Trade
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer">
              <div className="relative">
                <div className="h-48 bg-gradient-to-br from-[var(--slate-200)] to-[var(--slate-300)] rounded-t-lg"></div>
                <div className="absolute top-3 right-3 px-3 py-1 bg-gradient-to-r from-[var(--rarity-rare)] to-[var(--rarity-rare)] text-[var(--slate-900)] text-xs font-semibold rounded-full">
                  Rare
                </div>
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold text-[var(--slate-800)] mb-1">
                  Sheoldred, the Apocalypse
                </h3>
                <p className="text-sm text-[var(--slate-500)] mb-2">
                  Dominaria United
                </p>
                <p className="text-xl font-bold text-[var(--olive-600)] mb-3">
                  $85.00
                </p>
                <div className="flex gap-2 flex-wrap">
                  <span className="px-2 py-1 bg-[var(--condition-lp)]/10 text-[var(--condition-lp)] text-xs rounded-md">
                    LP
                  </span>
                  <span className="px-2 py-1 bg-[var(--info)]/10 text-[var(--info)] text-xs rounded-md">
                    Sale
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer">
              <div className="relative">
                <div className="h-48 bg-gradient-to-br from-[var(--slate-200)] to-[var(--slate-300)] rounded-t-lg"></div>
                <div className="absolute top-3 right-3 px-3 py-1 bg-gradient-to-r from-[var(--rarity-uncommon)] to-[var(--rarity-uncommon)] text-white text-xs font-semibold rounded-full">
                  Uncommon
                </div>
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold text-[var(--slate-800)] mb-1">
                  Lightning Bolt
                </h3>
                <p className="text-sm text-[var(--slate-500)] mb-2">
                  Double Masters 2022
                </p>
                <p className="text-xl font-bold text-[var(--olive-600)] mb-3">
                  $2.50
                </p>
                <div className="flex gap-2 flex-wrap">
                  <span className="px-2 py-1 bg-[var(--condition-nm)]/10 text-[var(--condition-nm)] text-xs rounded-md">
                    NM
                  </span>
                  <span className="px-2 py-1 bg-[var(--olive-100)] text-[var(--olive-700)] text-xs rounded-md">
                    Trade
                  </span>
                  <span className="px-2 py-1 bg-[var(--info)]/10 text-[var(--info)] text-xs rounded-md">
                    Sale
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer">
              <div className="relative">
                <div className="h-48 bg-gradient-to-br from-[var(--slate-200)] to-[var(--slate-300)] rounded-t-lg"></div>
                <div className="absolute top-3 right-3 px-3 py-1 bg-gradient-to-r from-[var(--rarity-rare)] to-[var(--rarity-rare)] text-[var(--slate-900)] text-xs font-semibold rounded-full">
                  Rare
                </div>
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold text-[var(--slate-800)] mb-1">
                  The One Ring
                </h3>
                <p className="text-sm text-[var(--slate-500)] mb-2">
                  Lord of the Rings
                </p>
                <p className="text-xl font-bold text-[var(--olive-600)] mb-3">
                  $125.00
                </p>
                <div className="flex gap-2 flex-wrap">
                  <span className="px-2 py-1 bg-[var(--condition-mp)]/10 text-[var(--condition-mp)] text-xs rounded-md">
                    MP
                  </span>
                  <span className="px-2 py-1 bg-[var(--info)]/10 text-[var(--info)] text-xs rounded-md">
                    Sale
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Daily Deals Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-[var(--slate-800)] mb-6 flex items-center gap-2">
            <div className="w-1 h-6 bg-[var(--gold-500)] rounded"></div>
            🎯 Daily Deals
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer border-2 border-[var(--gold-400)]">
              <div className="relative">
                <div className="h-48 bg-gradient-to-br from-[var(--slate-200)] to-[var(--slate-300)] rounded-t-lg"></div>
                <div className="absolute top-3 left-3 px-3 py-1 bg-gradient-to-r from-[var(--gold-500)] to-[var(--gold-600)] text-[var(--slate-900)] text-xs font-semibold rounded-full">
                  -25% TODAY
                </div>
                <div className="absolute top-3 right-3 px-3 py-1 bg-gradient-to-r from-[var(--rarity-rare)] to-[var(--rarity-rare)] text-[var(--slate-900)] text-xs font-semibold rounded-full">
                  Rare
                </div>
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold text-[var(--slate-800)] mb-1">
                  Force of Will
                </h3>
                <p className="text-sm text-[var(--slate-500)] mb-2">
                  Double Masters
                </p>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm text-[var(--slate-400)] line-through">
                    $80.00
                  </span>
                  <span className="text-xl font-bold text-[var(--olive-600)]">
                    $60.00
                  </span>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <span className="px-2 py-1 bg-[var(--condition-lp)]/10 text-[var(--condition-lp)] text-xs rounded-md">
                    LP
                  </span>
                  <span className="px-2 py-1 bg-[var(--gold-100)] text-[var(--gold-700)] text-xs rounded-md">
                    GameShop Pro
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Mobile Navigation */}
        <FloatingActionButton />
      </div>
    </div>
  );
}

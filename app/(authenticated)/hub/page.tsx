"use client";

import { CardGrid } from "@/app/_components/card-grid";
import { CollectionCard } from "@/app/_components/collection-card";
import {
  CreateCollectionCard,
  CreateWantListCard,
  ImportCollectionCard,
} from "@/app/_components/quick-action-card";
import { RecentActivityItem } from "@/app/_components/recent-activity-item";
import { SearchBar } from "@/app/_components/search-bar";
import { StatsCard } from "@/app/_components/stats-card";
import {
  useCollections,
  useRecentActivity,
  useUserStats,
} from "@/app/lib/hooks/mock-data";
import { DollarSign, Heart, MessageCircle, Package } from "lucide-react";

export default function HubPage() {
  const { data: userStats } = useUserStats();
  const { data: recentActivity } = useRecentActivity();
  const { data: collections } = useCollections();

  const handleSearch = (query: string) => {
    console.log("Searching for:", query);
    // TODO: Implement search functionality
  };

  const handleCreateCollection = () => {
    console.log("Navigate to create collection");
    // TODO: Navigate to create collection page
  };

  const handleImportCollection = () => {
    console.log("Navigate to import collection");
    // TODO: Navigate to import collection page
  };

  const handleCreateWantList = () => {
    console.log("Navigate to create want list");
    // TODO: Navigate to create want list page
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-olive-50 to-slate-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-olive-800 mb-4">
              Welcome to MTG Peddler
            </h1>
            <p className="text-lg text-slate-600 mb-8">
              Trade, buy, and sell Magic: The Gathering cards with collectors
              worldwide
            </p>

            <div className="max-w-2xl mx-auto">
              <SearchBar
                placeholder="Search cards, collections, or users..."
                onSearch={handleSearch}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">
            Your Trading Overview
          </h2>
          <CardGrid columns={4} className="mb-8">
            <StatsCard
              label="Total Cards"
              value={userStats.totalCards.toLocaleString()}
              icon={<Package className="h-6 w-6" />}
              change={{ value: 12, positive: true }}
            />
            <StatsCard
              label="Collection Value"
              value={`$${userStats.collectionValue.toLocaleString()}`}
              icon={<DollarSign className="h-6 w-6" />}
              change={{ value: 8, positive: true }}
            />
            <StatsCard
              label="Active Deals"
              value={userStats.activeDeals}
              icon={<MessageCircle className="h-6 w-6" />}
            />
            <StatsCard
              label="Want Matches"
              value={userStats.wantMatches}
              icon={<Heart className="h-6 w-6" />}
              change={{ value: 3, positive: true }}
            />
          </CardGrid>
        </div>

        {/* Quick Actions */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">
            Quick Actions
          </h2>
          <CardGrid columns={3}>
            <CreateCollectionCard onClick={handleCreateCollection} />
            <ImportCollectionCard onClick={handleImportCollection} />
            <CreateWantListCard onClick={handleCreateWantList} />
          </CardGrid>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Recent Collections */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900">
                Recent Collections
              </h2>
              <button className="text-olive-600 hover:text-olive-700 font-medium">
                View All
              </button>
            </div>
            <div className="space-y-4">
              {collections.slice(0, 5).map((collection) => (
                <CollectionCard key={collection.id} {...collection} />
              ))}
            </div>
          </div>

          {/* Active Deals Summary */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900">
                Active Deals
              </h2>
              <button className="text-olive-600 hover:text-olive-700 font-medium">
                View All
              </button>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Negotiating</span>
                  <span className="font-semibold text-yellow-600">2 deals</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Payment Pending</span>
                  <span className="font-semibold text-orange-600">1 deal</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Shipping</span>
                  <span className="font-semibold text-blue-600">3 deals</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Completed</span>
                  <span className="font-semibold text-green-600">12 deals</span>
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-slate-200">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">
                    Total Value in Progress
                  </span>
                  <span className="font-semibold text-slate-900">
                    $1,247.50
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity Feed */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-900">
              Recent Activity
            </h2>
            <button className="text-olive-600 hover:text-olive-700 font-medium">
              View All
            </button>
          </div>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <RecentActivityItem key={activity.id} {...activity} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

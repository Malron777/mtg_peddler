"use client";

import { CardGrid } from "@/app/_components/card-grid";
import { CollectionCard } from "@/app/_components/collection-card";
import { PageHeader } from "@/app/_components/page-header";
import { useGetCollectionInformation } from "@/app/lib/hooks/collection/use-collection-information.hook";
import { useGetUserCollections } from "@/app/lib/hooks/collection/use-collections-data.hook";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Folder, Plus } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

type FilterType = "all" | "public" | "private" | "trade" | "sale" | "both";

export default function CollectionsPage() {
  const { collections, loading, error, getUserCollections } =
    useGetUserCollections();
  const {
    data: metadata,
    loading: metadataLoading,
    error: metadataError,
    getCollectionInformation,
  } = useGetCollectionInformation();
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");

  // Load data on component mount
  useEffect(() => {
    getUserCollections();
    getCollectionInformation();
  }, [getUserCollections, getCollectionInformation]);

  const filteredCollections = Array.isArray(collections)
    ? collections.filter((collection) => {
        switch (activeFilter) {
          case "public":
            return collection.isPublic;
          case "private":
            return !collection.isPublic;
          case "trade":
          case "sale":
          case "both":
            // For now, show all collections for these filters since we don't have status data
            return true;
          default:
            return true;
        }
      })
    : [];

  // Helper function to get metadata for a collection
  const getCollectionMetadata = (collectionId: string) => {
    return metadata?.collections?.find((c) => c.id === collectionId);
  };

  // Show loading state
  if (loading || metadataLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-200 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-slate-200 rounded w-1/2 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-xl p-6 shadow-sm">
                  <div className="h-6 bg-slate-200 rounded mb-2"></div>
                  <div className="h-4 bg-slate-200 rounded"></div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white rounded-xl p-4 shadow-sm">
                  <div className="h-4 bg-slate-200 rounded mb-2"></div>
                  <div className="h-3 bg-slate-200 rounded mb-1"></div>
                  <div className="h-3 bg-slate-200 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error || metadataError) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="bg-red-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-4">
              <Folder className="h-12 w-12 text-red-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Error loading collections
            </h3>
            <p className="text-slate-600 mb-6">{error || metadataError}</p>
            <Button
              onClick={() => {
                getUserCollections();
                getCollectionInformation();
              }}
              className="bg-olive-600 hover:bg-olive-700 text-white"
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const filterTabs = [
    {
      key: "all",
      label: "All",
      count: Array.isArray(collections) ? collections.length : 0,
    },
    {
      key: "public",
      label: "Public",
      count: Array.isArray(collections)
        ? collections.filter((c) => c.isPublic).length
        : 0,
    },
    {
      key: "private",
      label: "Private",
      count: Array.isArray(collections)
        ? collections.filter((c) => !c.isPublic).length
        : 0,
    },
    {
      key: "trade",
      label: "For Trade",
      count: Array.isArray(collections) ? collections.length : 0, // Placeholder until we have status data
    },
    {
      key: "sale",
      label: "For Sale",
      count: Array.isArray(collections) ? collections.length : 0, // Placeholder until we have status data
    },
    {
      key: "both",
      label: "Trade & Sale",
      count: Array.isArray(collections) ? collections.length : 0, // Placeholder until we have status data
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PageHeader
          title="My Collections"
          description="Manage your Magic: The Gathering card collections"
          actions={
            <Link href="/collections/create">
              <Button className="bg-olive-600 hover:bg-olive-700 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Create Collection
              </Button>
            </Link>
          }
        />

        {/* Stats Bar */}
        <div className="bg-white rounded-xl p-6 mb-8 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-900">
                {Array.isArray(collections) ? collections.length : 0}
              </div>
              <div className="text-sm text-slate-600">Total Collections</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-900">
                {metadata?.totalCards || 0}
              </div>
              <div className="text-sm text-slate-600">Total Cards</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-900">
                {metadata?.totalValue
                  ? new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: "USD",
                    }).format(metadata.totalValue)
                  : "$0"}
              </div>
              <div className="text-sm text-slate-600">Total Value</div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            {filterTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveFilter(tab.key as FilterType)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeFilter === tab.key
                    ? "bg-olive-600 text-white"
                    : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
                }`}
              >
                {tab.label}
                <Badge
                  variant="secondary"
                  className={`ml-2 ${
                    activeFilter === tab.key
                      ? "bg-white/20 text-white"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {tab.count}
                </Badge>
              </button>
            ))}
          </div>
        </div>

        {/* Collections Grid */}
        {filteredCollections.length > 0 ? (
          <CardGrid>
            {filteredCollections.map((collection) => {
              const collectionMetadata = getCollectionMetadata(collection.id);
              return (
                <Link
                  key={collection.id}
                  href={`/collections/${collection.id}`}
                >
                  <CollectionCard
                    id={collection.id}
                    name={collection.name}
                    cardCount={collectionMetadata?.cardCount || 0}
                    value={collectionMetadata?.totalValue}
                    isPublic={collection.isPublic}
                    pendingDeals={collectionMetadata?.dealCount || 0}
                    lastUpdated={
                      new Date(collection.updatedAt || collection.createdAt)
                    }
                    status="trade" // Default status
                  />
                </Link>
              );
            })}
          </CardGrid>
        ) : (
          <div className="text-center py-12">
            <div className="bg-slate-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-4">
              <Folder className="h-12 w-12 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              No collections found
            </h3>
            <p className="text-slate-600 mb-6">
              {activeFilter === "all"
                ? "You haven't created any collections yet."
                : `No collections match the "${activeFilter}" filter.`}
            </p>
            <Link href="/collections/create">
              <Button className="bg-olive-600 hover:bg-olive-700 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Collection
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

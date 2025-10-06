"use client";

import { CardGrid } from "@/app/_components/card-grid";
import { CollectionCard } from "@/app/_components/collection-card";
import { PageHeader } from "@/app/_components/page-header";
import { useCollections } from "@/app/lib/hooks/mock-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Folder, Plus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

type FilterType = "all" | "public" | "private" | "trade" | "sale";

export default function CollectionsPage() {
  const { data: collections } = useCollections();
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");

  const filteredCollections = collections.filter((collection) => {
    switch (activeFilter) {
      case "public":
        return collection.isPublic;
      case "private":
        return !collection.isPublic;
      case "trade":
        return collection.status === "trade";
      case "sale":
        return collection.status === "sale";
      default:
        return true;
    }
  });

  const totalCards = collections.reduce((sum, c) => sum + c.cardCount, 0);
  const totalValue = collections.reduce((sum, c) => sum + (c.value || 0), 0);

  const filterTabs = [
    { key: "all", label: "All", count: collections.length },
    {
      key: "public",
      label: "Public",
      count: collections.filter((c) => c.isPublic).length,
    },
    {
      key: "private",
      label: "Private",
      count: collections.filter((c) => !c.isPublic).length,
    },
    {
      key: "trade",
      label: "For Trade",
      count: collections.filter((c) => c.status === "trade").length,
    },
    {
      key: "sale",
      label: "For Sale",
      count: collections.filter((c) => c.status === "sale").length,
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
                {collections.length}
              </div>
              <div className="text-sm text-slate-600">Total Collections</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-900">
                {totalCards.toLocaleString()}
              </div>
              <div className="text-sm text-slate-600">Total Cards</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-900">
                ${totalValue.toLocaleString()}
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
            {filteredCollections.map((collection) => (
              <Link key={collection.id} href={`/collections/${collection.id}`}>
                <CollectionCard {...collection} />
              </Link>
            ))}
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

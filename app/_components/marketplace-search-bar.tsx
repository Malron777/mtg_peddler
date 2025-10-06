"use client";

import { useSearchCards } from "@/app/lib/hooks/card/use-marketplace-cards.hook";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Filter, Search, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface CardSearchResult {
  card: {
    scryfallId: string;
    name: string;
    setName: string;
    imageUris?: {
      small?: string;
      normal?: string;
    };
  };
  currentPrice?: number;
  priceSource?: string;
  availableQuantity?: number;
  collectionsWithCard?: Array<{
    collectionId: string;
    collectionName: string;
    ownerName: string;
    quantity: number;
    condition: string;
    isFoil: boolean;
    listingType: string;
    customPrice?: number;
  }>;
}

interface MarketplaceSearchBarProps {
  onSearch?: (query: string) => void;
  placeholder?: string;
  showResults?: boolean;
  className?: string;
}

export default function MarketplaceSearchBar({
  onSearch,
  placeholder = "Search for cards, sets, or traders...",
  showResults = true,
  className = "",
}: MarketplaceSearchBarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    onlyAvailable: true,
    priceSource: "tcg" as
      | "tcg"
      | "scg"
      | "custom"
      | "mtggoldfish"
      | "cardmarket",
    sortBy: "name" as "name" | "price" | "setName",
    sortOrder: "asc" as "asc" | "desc",
  });

  const { cards, loading, error, searchCards } = useSearchCards();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearching(true);
      try {
        await searchCards({
          query: searchQuery,
          ...filters,
          pageSize: 20,
        });
        onSearch?.(searchQuery);
      } catch (error) {
        console.error("Search failed:", error);
      } finally {
        setIsSearching(false);
      }
    }
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setIsSearching(false);
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity?.toLowerCase()) {
      case "mythic":
        return "bg-gradient-to-r from-[var(--rarity-mythic)] to-[var(--rarity-mythic)] text-white";
      case "rare":
        return "bg-gradient-to-r from-[var(--rarity-rare)] to-[var(--rarity-rare)] text-[var(--slate-900)]";
      case "uncommon":
        return "bg-gradient-to-r from-[var(--rarity-uncommon)] to-[var(--rarity-uncommon)] text-white";
      case "common":
        return "bg-gradient-to-r from-[var(--rarity-common)] to-[var(--rarity-common)] text-white";
      default:
        return "bg-[var(--slate-200)] text-[var(--slate-700)]";
    }
  };

  const getConditionColor = (condition: string) => {
    switch (condition?.toLowerCase()) {
      case "nm":
      case "near mint":
        return "bg-[var(--condition-nm)]/10 text-[var(--condition-nm)]";
      case "lp":
      case "lightly played":
        return "bg-[var(--condition-lp)]/10 text-[var(--condition-lp)]";
      case "mp":
      case "moderately played":
        return "bg-[var(--condition-mp)]/10 text-[var(--condition-mp)]";
      case "hp":
      case "heavily played":
        return "bg-[var(--condition-hp)]/10 text-[var(--condition-hp)]";
      case "dmg":
      case "damaged":
        return "bg-[var(--condition-dmg)]/10 text-[var(--condition-dmg)]";
      default:
        return "bg-[var(--slate-100)] text-[var(--slate-600)]";
    }
  };

  const getListingTypeColor = (listingType: string) => {
    switch (listingType?.toLowerCase()) {
      case "trade":
        return "bg-[var(--olive-100)] text-[var(--olive-700)]";
      case "sale":
        return "bg-[var(--info)]/10 text-[var(--info)]";
      case "both":
        return "bg-[var(--status-both)]/10 text-[var(--status-both)]";
      default:
        return "bg-[var(--slate-100)] text-[var(--slate-600)]";
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Search Form */}
      <form onSubmit={handleSearch} className="relative">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[var(--slate-400)] w-5 h-5" />
          <Input
            type="text"
            placeholder={placeholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 pr-20 py-4 text-lg border-2 border-[var(--olive-200)] rounded-md focus:border-[var(--olive-400)] focus:ring-4 focus:ring-[var(--olive-100)] transition-all"
          />
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-2">
            {searchQuery && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleClearSearch}
                className="h-8 w-8 p-0 hover:bg-[var(--slate-100)]"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="h-8 w-8 p-0 hover:bg-[var(--slate-100)]"
            >
              <Filter className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </form>

      {/* Filters */}
      {showFilters && (
        <Card className="absolute top-full left-0 right-0 mt-2 z-50 shadow-lg rounded-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Search Filters</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="onlyAvailable"
                checked={filters.onlyAvailable}
                onChange={(e) =>
                  setFilters({ ...filters, onlyAvailable: e.target.checked })
                }
                className="rounded border-[var(--olive-200)]"
              />
              <label htmlFor="onlyAvailable" className="text-sm">
                Only show cards available in public collections
              </label>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Price Source
                </label>
                <select
                  value={filters.priceSource}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      priceSource: e.target.value as any,
                    })
                  }
                  className="w-full p-2 border border-[var(--olive-200)] rounded-md text-sm"
                >
                  <option value="tcg">TCGPlayer</option>
                  <option value="scg">Star City Games</option>
                  <option value="mtggoldfish">MTGGoldfish</option>
                  <option value="cardmarket">CardMarket</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Sort By
                </label>
                <select
                  value={filters.sortBy}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      sortBy: e.target.value as any,
                    })
                  }
                  className="w-full p-2 border border-[var(--olive-200)] rounded-md text-sm"
                >
                  <option value="name">Name</option>
                  <option value="price">Price</option>
                  <option value="setName">Set</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search Results */}
      {showResults && isSearching && (
        <Card className="absolute top-full left-0 right-0 mt-2 z-40 shadow-lg max-h-96 overflow-y-auto rounded-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Search Results</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--olive-500)]"></div>
              </div>
            ) : error ? (
              <div className="text-center py-8 text-[var(--error)]">
                {error}
              </div>
            ) : cards && cards.length > 0 ? (
              <div className="space-y-3">
                {cards.map((result: CardSearchResult, index: number) => (
                  <Link
                    key={`${result.card.scryfallId}-${index}`}
                    href={`/marketplace/search?card=${result.card.scryfallId}`}
                    className="block p-3 hover:bg-[var(--olive-50)] rounded-md transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-16 bg-gradient-to-br from-[var(--slate-200)] to-[var(--slate-300)] rounded-md flex-shrink-0">
                        {result.card.imageUris?.small && (
                          <img
                            src={result.card.imageUris.small}
                            alt={result.card.name}
                            className="w-full h-full object-cover rounded-md"
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-[var(--slate-800)] truncate">
                          {result.card.name}
                        </h3>
                        <p className="text-sm text-[var(--slate-500)]">
                          {result.card.setName}
                        </p>
                        {result.currentPrice && (
                          <p className="text-sm font-semibold text-[var(--olive-600)]">
                            ${result.currentPrice.toFixed(2)}
                          </p>
                        )}
                        {result.collectionsWithCard &&
                          result.collectionsWithCard.length > 0 && (
                            <div className="flex gap-1 mt-1">
                              {result.collectionsWithCard
                                .slice(0, 3)
                                .map((collection, idx) => (
                                  <span
                                    key={idx}
                                    className={`px-2 py-1 text-xs rounded-md ${getConditionColor(
                                      collection.condition
                                    )}`}
                                  >
                                    {collection.condition}
                                  </span>
                                ))}
                              {result.collectionsWithCard.length > 3 && (
                                <span className="text-xs text-[var(--slate-500)]">
                                  +{result.collectionsWithCard.length - 3} more
                                </span>
                              )}
                            </div>
                          )}
                      </div>
                    </div>
                  </Link>
                ))}
                {cards.length >= 20 && (
                  <div className="text-center py-2">
                    <Link
                      href={`/marketplace/search?q=${encodeURIComponent(
                        searchQuery
                      )}`}
                      className="text-sm text-[var(--olive-600)] hover:text-[var(--olive-700)]"
                    >
                      View all results →
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-[var(--slate-500)]">
                No cards found. Try a different search term.
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

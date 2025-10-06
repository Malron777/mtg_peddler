"use client";

import { CardGrid } from "@/app/_components/card-grid";
import { PageHeader } from "@/app/_components/page-header";
import { SearchBar } from "@/app/_components/search-bar";
import { useMarketplaceSearch } from "@/app/lib/hooks/mock-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  ChevronDown,
  MapPin,
  ShoppingCart,
  SlidersHorizontal,
  Star,
} from "lucide-react";
import { useState } from "react";

interface MarketplaceCardProps {
  item: {
    id: string;
    name: string;
    set: string;
    rarity: "common" | "uncommon" | "rare" | "mythic" | "special";
    condition: "nm" | "lp" | "mp" | "hp" | "dmg";
    price: number;
    seller: {
      name: string;
      rating: number;
      reviewCount: number;
    };
    location: string;
    shipping: string;
    imageUrl?: string;
  };
}

function MarketplaceCard({ item }: MarketplaceCardProps) {
  const rarityColors = {
    common: "bg-slate-600",
    uncommon: "bg-slate-500",
    rare: "bg-gradient-to-r from-yellow-400 to-yellow-600",
    mythic: "bg-gradient-to-r from-orange-500 to-orange-700",
    special: "bg-gradient-to-r from-purple-500 to-purple-700",
  };

  const conditionLabels = {
    nm: "Near Mint",
    lp: "Lightly Played",
    mp: "Moderately Played",
    hp: "Heavily Played",
    dmg: "Damaged",
  };

  const conditionColors = {
    nm: "bg-green-100 text-green-700",
    lp: "bg-blue-100 text-blue-700",
    mp: "bg-yellow-100 text-yellow-700",
    hp: "bg-orange-100 text-orange-700",
    dmg: "bg-red-100 text-red-700",
  };

  return (
    <Card className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden p-1">
      <div className="relative">
        <div className="aspect-[200/280] bg-slate-100 flex items-center justify-center">
          <img
            src={item.imageUrl || "/card_back.png"}
            alt={item.name}
            className="w-full h-full object-cover"
          />
        </div>

        <Badge
          className={`absolute top-2 left-2 ${
            rarityColors[item.rarity]
          } text-white`}
        >
          {item.rarity.toUpperCase()}
        </Badge>

        <Badge
          className={`absolute top-2 right-2 ${
            conditionColors[item.condition]
          }`}
        >
          {conditionLabels[item.condition]}
        </Badge>
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-slate-900 mb-1 truncate">
          {item.name}
        </h3>
        <p className="text-sm text-slate-600 mb-2">{item.set}</p>

        <div className="flex items-center gap-1 mb-3">
          <Star className="h-4 w-4 text-yellow-400 fill-current" />
          <span className="text-sm font-medium text-slate-700">
            {item.seller.rating}
          </span>
          <span className="text-sm text-slate-500">
            ({item.seller.reviewCount})
          </span>
        </div>

        <div className="flex items-center gap-1 text-sm text-slate-600 mb-3">
          <MapPin className="h-4 w-4" />
          <span>{item.location}</span>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <div className="text-lg font-bold text-slate-900">
              ${item.price.toFixed(2)}
            </div>
            <div className="text-xs text-slate-500">{item.shipping}</div>
          </div>

          <Button
            size="sm"
            className="bg-olive-600 hover:bg-olive-700 text-white"
          >
            <ShoppingCart className="h-4 w-4 mr-1" />
            Buy
          </Button>
        </div>
      </div>
    </Card>
  );
}

export default function MarketplacePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [province, setProvince] = useState("");
  const { data: marketplaceItems } = useMarketplaceSearch(searchQuery);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleToggleFilters = () => {
    setShowFilters(!showFilters);
  };

  const handleConditionToggle = (condition: string) => {
    setSelectedConditions((prev) =>
      prev.includes(condition)
        ? prev.filter((c) => c !== condition)
        : [...prev, condition]
    );
  };

  const handleSelectAllConditions = () => {
    const allConditions = ["nm", "lp", "mp", "hp", "dmg"];
    setSelectedConditions(
      selectedConditions.length === allConditions.length ? [] : allConditions
    );
  };

  const handleClearPriceFilters = () => {
    setPriceMin("");
    setPriceMax("");
  };

  const handleClearAllFilters = () => {
    setPriceMin("");
    setPriceMax("");
    setSelectedConditions([]);
    setProvince("");
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PageHeader
          title="Marketplace"
          description="Find and buy Magic: The Gathering cards from sellers worldwide"
        />

        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <SearchBar
                placeholder="Search for cards, sets, or sellers..."
                onSearch={handleSearch}
                filters={
                  <Button
                    variant="outline"
                    onClick={handleToggleFilters}
                    className="flex items-center gap-2"
                  >
                    <SlidersHorizontal className="h-4 w-4" />
                    Filters
                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${
                        showFilters ? "rotate-180" : ""
                      }`}
                    />
                  </Button>
                }
              />
            </div>
          </div>

          {/* Filter Sidebar */}
          {showFilters && (
            <Card className="mt-4 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-slate-900">
                  Filters
                </h3>
                <Button
                  onClick={handleClearAllFilters}
                  variant="outline"
                  size="sm"
                  className="text-slate-600 hover:text-slate-800"
                >
                  Clear All
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h3 className="font-medium text-slate-900 mb-3">
                    Price Range
                  </h3>
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        placeholder="Min"
                        value={priceMin}
                        onChange={(e) => setPriceMin(e.target.value)}
                        className="flex-1"
                      />
                      <Input
                        type="number"
                        placeholder="Max"
                        value={priceMax}
                        onChange={(e) => setPriceMax(e.target.value)}
                        className="flex-1"
                      />
                    </div>
                    {(priceMin || priceMax) && (
                      <Button
                        onClick={handleClearPriceFilters}
                        variant="outline"
                        size="sm"
                        className="w-full"
                      >
                        Clear Price Filters
                      </Button>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-slate-900 mb-3">Condition</h3>
                  <div className="space-y-2">
                    <Button
                      onClick={handleSelectAllConditions}
                      variant="outline"
                      size="sm"
                      className="w-full mb-2"
                    >
                      {selectedConditions.length === 5
                        ? "Deselect All"
                        : "Select All"}
                    </Button>
                    {["nm", "lp", "mp", "hp", "dmg"].map((condition) => (
                      <label key={condition} className="flex items-center">
                        <input
                          type="checkbox"
                          className="mr-2"
                          checked={selectedConditions.includes(condition)}
                          onChange={() => handleConditionToggle(condition)}
                        />
                        <span className="text-sm text-slate-700 capitalize">
                          {condition === "nm"
                            ? "Near Mint"
                            : condition === "lp"
                            ? "Lightly Played"
                            : condition === "mp"
                            ? "Moderately Played"
                            : condition === "hp"
                            ? "Heavily Played"
                            : "Damaged"}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-slate-900 mb-3">Province</h3>
                  <div className="space-y-2">
                    <Input
                      type="text"
                      placeholder="Enter Province"
                      value={province}
                      onChange={(e) => setProvince(e.target.value)}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              {searchQuery
                ? `Search Results for "${searchQuery}"`
                : "Featured Cards"}
            </h2>
            <p className="text-slate-600">
              {marketplaceItems.length} cards found
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-600">Sort by:</span>
            <select className="px-3 py-2 border border-slate-300 rounded-md text-sm">
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
              <option>Newest First</option>
              <option>Seller Rating</option>
            </select>
          </div>
        </div>

        {/* Marketplace Cards */}
        {marketplaceItems.length > 0 ? (
          <CardGrid>
            {marketplaceItems.map((item) => (
              <MarketplaceCard key={item.id} item={item} />
            ))}
          </CardGrid>
        ) : (
          <div className="text-center py-12">
            <div className="bg-slate-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-4">
              <ShoppingCart className="h-12 w-12 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              No cards found
            </h3>
            <p className="text-slate-600 mb-6">
              Try adjusting your search terms or filters to find what
              you&apos;re looking for.
            </p>
            <Button onClick={() => setSearchQuery("")} variant="outline">
              Clear Search
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

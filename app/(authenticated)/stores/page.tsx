"use client";

import { CardGrid } from "@/app/_components/card-grid";
import { PageHeader } from "@/app/_components/page-header";
import { SearchBar } from "@/app/_components/search-bar";
import { useStores } from "@/app/lib/hooks/mock-data";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  ChevronDown,
  ExternalLink,
  Globe,
  MapPin,
  Shield,
  SlidersHorizontal,
  Star,
} from "lucide-react";
import { useState } from "react";

interface StoreCardProps {
  store: {
    id: string;
    name: string;
    location: string;
    rating: number;
    reviewCount: number;
    specialties: string[];
    logoUrl?: string;
    isVerified: boolean;
    isOnlineOnly: boolean;
  };
}

function StoreCard({ store }: StoreCardProps) {
  return (
    <Card className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6">
      <div className="flex items-start gap-4 mb-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src={store.logoUrl} />
          <AvatarFallback className="bg-olive-100 text-olive-700">
            {store.name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-semibold text-slate-900">{store.name}</h3>
            {store.isVerified && (
              <Badge className="bg-blue-100 text-blue-700">
                <Shield className="h-3 w-3 mr-1" />
                Verified
              </Badge>
            )}
            {store.isOnlineOnly && (
              <Badge className="bg-purple-100 text-purple-700">
                <Globe className="h-3 w-3 mr-1" />
                Online Only
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-1 text-sm text-slate-600 mb-2">
            <MapPin className="h-4 w-4" />
            <span>{store.location}</span>
          </div>

          <div className="flex items-center gap-1 mb-3">
            <Star className="h-4 w-4 text-yellow-400 fill-current" />
            <span className="text-sm font-medium text-slate-700">
              {store.rating}
            </span>
            <span className="text-sm text-slate-500">
              ({store.reviewCount} reviews)
            </span>
          </div>

          <div className="flex flex-wrap gap-1 mb-4">
            {store.specialties.slice(0, 3).map((specialty) => (
              <Badge key={specialty} variant="secondary" className="text-xs">
                {specialty}
              </Badge>
            ))}
            {store.specialties.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{store.specialties.length - 3} more
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <Button className="flex-1 bg-olive-600 hover:bg-olive-700 text-white">
          <ExternalLink className="h-4 w-4 mr-2" />
          Visit Store
        </Button>
        <Button variant="outline">Message</Button>
      </div>
    </Card>
  );
}

export default function StoresPage() {
  const { data: stores } = useStores();
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filterVerified, setFilterVerified] = useState(false);
  const [filterOnlineOnly, setFilterOnlineOnly] = useState(false);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const filteredStores = stores.filter((store) => {
    const matchesSearch =
      !searchQuery ||
      store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      store.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      store.specialties.some((s) =>
        s.toLowerCase().includes(searchQuery.toLowerCase())
      );

    const matchesVerified = !filterVerified || store.isVerified;
    const matchesOnlineOnly = !filterOnlineOnly || store.isOnlineOnly;

    return matchesSearch && matchesVerified && matchesOnlineOnly;
  });

  const verifiedStores = stores.filter((s) => s.isVerified).length;
  const onlineOnlyStores = stores.filter((s) => s.isOnlineOnly).length;
  const averageRating =
    stores.reduce((sum, s) => sum + s.rating, 0) / stores.length;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PageHeader
          title="Stores"
          description="Discover Magic: The Gathering stores and sellers"
        />

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">
                  Total Stores
                </p>
                <p className="text-2xl font-bold text-slate-900">
                  {stores.length}
                </p>
              </div>
              <MapPin className="h-8 w-8 text-olive-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Verified</p>
                <p className="text-2xl font-bold text-slate-900">
                  {verifiedStores}
                </p>
              </div>
              <Shield className="h-8 w-8 text-blue-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">
                  Online Only
                </p>
                <p className="text-2xl font-bold text-slate-900">
                  {onlineOnlyStores}
                </p>
              </div>
              <Globe className="h-8 w-8 text-purple-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Avg Rating</p>
                <p className="text-2xl font-bold text-slate-900">
                  {averageRating.toFixed(1)}
                </p>
              </div>
              <Star className="h-8 w-8 text-yellow-600" />
            </div>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <SearchBar
                placeholder="Search stores, locations, or specialties..."
                onSearch={handleSearch}
                filters={
                  <Button
                    variant="outline"
                    onClick={() => setShowFilters(!showFilters)}
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

          {/* Filter Options */}
          {showFilters && (
            <Card className="mt-4 p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h3 className="font-medium text-slate-900 mb-3">
                    Store Type
                  </h3>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filterVerified}
                        onChange={(e) => setFilterVerified(e.target.checked)}
                        className="mr-2"
                      />
                      <span className="text-sm text-slate-700">
                        Verified Stores Only
                      </span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filterOnlineOnly}
                        onChange={(e) => setFilterOnlineOnly(e.target.checked)}
                        className="mr-2"
                      />
                      <span className="text-sm text-slate-700">
                        Online Only
                      </span>
                    </label>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-slate-900 mb-3">Location</h3>
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="City, State, Country"
                      className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
                    />
                    <div className="flex items-center">
                      <input type="checkbox" className="mr-2" />
                      <span className="text-sm text-slate-700">Near Me</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-slate-900 mb-3">
                    Specialties
                  </h3>
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="Search specialties..."
                      className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
                    />
                    <div className="max-h-32 overflow-y-auto space-y-1">
                      {[
                        "Modern",
                        "Legacy",
                        "Vintage",
                        "Commander",
                        "Pauper",
                        "Standard",
                      ].map((specialty) => (
                        <label key={specialty} className="flex items-center">
                          <input type="checkbox" className="mr-2" />
                          <span className="text-sm text-slate-700">
                            {specialty}
                          </span>
                        </label>
                      ))}
                    </div>
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
                : "All Stores"}
            </h2>
            <p className="text-slate-600">
              {filteredStores.length} stores found
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-600">Sort by:</span>
            <select className="px-3 py-2 border border-slate-300 rounded-md text-sm">
              <option>Rating: High to Low</option>
              <option>Rating: Low to High</option>
              <option>Name: A to Z</option>
              <option>Name: Z to A</option>
              <option>Most Reviews</option>
            </select>
          </div>
        </div>

        {/* Featured Stores Carousel Placeholder */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            Featured Stores
          </h3>
          <div className="bg-gradient-to-r from-olive-50 to-slate-50 rounded-xl p-6">
            <p className="text-slate-600 text-center">
              Featured stores carousel will be implemented here
            </p>
          </div>
        </div>

        {/* Stores Grid */}
        {filteredStores.length > 0 ? (
          <CardGrid>
            {filteredStores.map((store) => (
              <StoreCard key={store.id} store={store} />
            ))}
          </CardGrid>
        ) : (
          <div className="text-center py-12">
            <div className="bg-slate-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-4">
              <MapPin className="h-12 w-12 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              No stores found
            </h3>
            <p className="text-slate-600 mb-6">
              Try adjusting your search terms or filters to find stores.
            </p>
            <Button
              onClick={() => {
                setSearchQuery("");
                setFilterVerified(false);
                setFilterOnlineOnly(false);
              }}
              variant="outline"
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScryfallCard } from "@/src/app/services/scryfall.service";
import { X } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

interface CardSearchPanelProps {
  isOpen: boolean;
  searchResults: ScryfallCard[] | null;
  loading: boolean;
  error: string | null;
  onClose: () => void;
  onSearch: (query: string) => void;
  onSelectCard: (card: ScryfallCard) => void;
}

export function CardSearchPanel({
  isOpen,
  searchResults,
  loading,
  error,
  onClose,
  onSearch,
  onSelectCard,
}: CardSearchPanelProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [lastSuccessfulQuery, setLastSuccessfulQuery] = useState<string | null>(
    null
  );
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const DEBOUNCE_DELAY = 500; // Debounce delay to prevent excessive requests

  // Track successful searches to prevent redundant API calls
  useEffect(() => {
    if (searchResults && !loading && !error && searchQuery.trim()) {
      setLastSuccessfulQuery(searchQuery.trim());
    }
  }, [searchResults, loading, error, searchQuery]);

  // Debounced search effect
  useEffect(() => {
    if (!searchQuery.trim()) return;

    // Don't search again if we already have successful results for this query
    if (
      lastSuccessfulQuery === searchQuery.trim() &&
      searchResults &&
      !loading &&
      !error
    ) {
      return;
    }

    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      onSearch(searchQuery);
    }, DEBOUNCE_DELAY);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [
    searchQuery,
    onSearch,
    lastSuccessfulQuery,
    searchResults,
    loading,
    error,
  ]);

  const handleSearch = useCallback(() => {
    if (searchQuery.trim()) {
      // Reset the last successful query to allow immediate search
      setLastSuccessfulQuery(null);
      onSearch(searchQuery);
    }
  }, [searchQuery, onSearch]);

  // Reset state when panel is closed
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery("");
      setLastSuccessfulQuery(null);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="bg-white rounded-xl p-6 mb-8 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Add Cards to Collection</h3>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className="space-y-4">
        <div>
          <Label htmlFor="card-search">Search for Cards</Label>
          <div className="flex gap-2">
            <Input
              id="card-search"
              placeholder="Enter card name to search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearch();
                }
              }}
              className="flex-1"
            />
            <Button
              onClick={handleSearch}
              disabled={loading}
              className="bg-olive-600 hover:bg-olive-700 text-white disabled:opacity-50"
            >
              Search
            </Button>
          </div>
        </div>

        {loading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-olive-600 mx-auto"></div>
            <p className="mt-2 text-slate-600">Searching cards...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-8">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {!loading && !error && searchResults && searchResults.length === 0 && (
          <div className="text-center py-8">
            <p className="text-slate-600">
              No cards found. Try a different search term.
            </p>
          </div>
        )}

        {!loading && !error && searchResults && searchResults.length > 0 && (
          <div>
            <p className="text-sm text-slate-600 mb-4">
              Found {searchResults.length} cards. Click on a card to add it to
              your collection:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
              {searchResults.map((card) => (
                <div
                  key={card.id}
                  className="p-4 border rounded-lg cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => {
                    console.log(
                      "Selected card:",
                      card.name,
                      "image_uris:",
                      card.image_uris,
                      "image_status:",
                      card.image_status
                    );
                    onSelectCard(card);
                  }}
                >
                  <div className="aspect-[488/680] relative mb-3">
                    <Image
                      src={
                        card.image_uris?.normal ||
                        card.image_uris?.small ||
                        "/card_back.png"
                      }
                      alt={card.name}
                      fill
                      className="object-contain rounded"
                      onError={(e) => {
                        console.log(
                          "Search panel image failed to load for card:",
                          card.name,
                          "image_uris:",
                          card.image_uris
                        );
                        e.currentTarget.src = "/card_back.png";
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold text-sm line-clamp-2">
                      {card.name}
                    </h3>
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="text-xs">
                        {card.set_name}
                      </Badge>
                      <span className="text-xs text-slate-600">
                        {card.collector_number}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-xs">
                        {card.rarity}
                      </Badge>
                      {card.prices?.usd && (
                        <span className="text-xs font-medium">
                          ${card.prices.usd}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

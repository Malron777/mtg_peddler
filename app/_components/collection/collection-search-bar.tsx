"use client";

import { SearchBar } from "@/app/_components/search-bar";
import { Button } from "@/components/ui/button";
import { Grid3X3, List } from "lucide-react";

interface CollectionSearchBarProps {
  viewMode: "grid" | "list";
  onSearch: (query: string) => void;
  onViewModeChange: (mode: "grid" | "list") => void;
}

export function CollectionSearchBar({
  viewMode,
  onSearch,
  onViewModeChange,
}: CollectionSearchBarProps) {
  return (
    <div className="mb-8">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex-1 max-w-2xl">
          <SearchBar
            placeholder="Search cards in this collection..."
            onSearch={onSearch}
          />
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === "grid" ? "default" : "outline"}
            size="sm"
            onClick={() => onViewModeChange("grid")}
            className="flex items-center gap-2"
          >
            <Grid3X3 className="h-4 w-4" />
            Grid
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="sm"
            onClick={() => onViewModeChange("list")}
            className="flex items-center gap-2"
          >
            <List className="h-4 w-4" />
            List
          </Button>
        </div>
      </div>
    </div>
  );
}

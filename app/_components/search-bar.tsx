"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Filter, Search } from "lucide-react";
import React, { useState } from "react";

interface SearchBarProps {
  placeholder: string;
  onSearch: (query: string) => void;
  suggestions?: boolean;
  filters?: React.ReactNode;
  className?: string;
}

export function SearchBar({
  placeholder,
  onSearch,
  suggestions = false,
  filters,
  className,
}: SearchBarProps) {
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);

    // Debounce search for better performance
    const timeoutId = setTimeout(() => {
      onSearch(value);
    }, 300);

    return () => clearTimeout(timeoutId);
  };

  return (
    <div className={cn("w-full max-w-2xl mx-auto", className)}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            type="text"
            placeholder={placeholder}
            value={query}
            onChange={handleInputChange}
            className="pl-10 pr-20 h-12 focus:ring-2 focus:ring-olive-400 focus:border-olive-400"
          />
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-1">
            {filters && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 px-2"
              >
                <Filter className="h-4 w-4" />
              </Button>
            )}
            <Button
              type="submit"
              size="sm"
              className="h-8 px-3 bg-olive-600 hover:bg-olive-700"
            >
              Search
            </Button>
          </div>
        </div>
      </form>

      {filters && <div className="mt-4">{filters}</div>}
    </div>
  );
}

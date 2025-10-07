"use client";

import { SearchBar } from "@/app/_components/search-bar";
import { useGetAllCollectionItemsForCollection } from "@/app/lib/hooks/collection/use-collection-items.hook";
import { useGetCollection } from "@/app/lib/hooks/collection/use-collections-data.hook";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  DollarSign,
  Download,
  Edit,
  Eye,
  EyeOff,
  Grid3X3,
  List,
  Package,
  Plus,
  Trash2,
  Upload,
  Users,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { useEffect, useState } from "react";

interface CollectionDetailPageProps {
  params: {
    id: string;
  };
}

export default function CollectionDetailPage({
  params,
}: CollectionDetailPageProps) {
  const {
    collection,
    loading: collectionLoading,
    error: collectionError,
    getCollection,
  } = useGetCollection();
  const {
    collectionItems,
    loading: itemsLoading,
    error: itemsError,
    getAllCollectionItemsForCollection,
  } = useGetAllCollectionItemsForCollection();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [, setSearchQuery] = useState("");

  // Load collection and items on component mount
  useEffect(() => {
    getCollection(params.id);
    getAllCollectionItemsForCollection(params.id);
  }, [params.id, getCollection, getAllCollectionItemsForCollection]);

  // Show loading state
  if (collectionLoading || itemsLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-6 bg-slate-200 rounded w-1/4 mb-6"></div>
            <div className="bg-white rounded-xl p-6 mb-8 shadow-sm">
              <div className="h-8 bg-slate-200 rounded w-1/3 mb-4"></div>
              <div className="h-4 bg-slate-200 rounded w-1/2 mb-4"></div>
              <div className="flex gap-4">
                <div className="h-4 bg-slate-200 rounded w-24"></div>
                <div className="h-4 bg-slate-200 rounded w-24"></div>
                <div className="h-4 bg-slate-200 rounded w-24"></div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="h-6 bg-slate-200 rounded w-1/4 mb-6"></div>
              <div className="text-center py-12">
                <div className="bg-slate-100 rounded-full w-24 h-24 mx-auto mb-4"></div>
                <div className="h-4 bg-slate-200 rounded w-1/3 mx-auto mb-2"></div>
                <div className="h-3 bg-slate-200 rounded w-1/2 mx-auto"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show error state or not found
  if (collectionError || itemsError || !collection) {
    notFound();
  }

  // Calculate card count and value
  const cardCount =
    collectionItems?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;
  const totalValue =
    collectionItems?.reduce((sum) => {
      // TODO: Calculate actual value based on card prices
      return sum + 0; // Placeholder
    }, 0) || 0;

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // TODO: Implement search functionality
  };

  const handleToggleVisibility = () => {
    // TODO: Implement visibility toggle
    console.log("Toggle visibility");
  };

  const handleEditCollection = () => {
    // TODO: Navigate to edit collection page
    console.log("Edit collection");
  };

  const handleAddCards = () => {
    // TODO: Navigate to add cards page
    console.log("Add cards");
  };

  const handleImportCards = () => {
    // TODO: Navigate to import cards page
    console.log("Import cards");
  };

  const handleExportCollection = () => {
    // TODO: Implement export functionality
    console.log("Export collection");
  };

  const handleDeleteCollection = () => {
    // TODO: Implement delete functionality with confirmation
    console.log("Delete collection");
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-sm text-slate-600 mb-6">
          <Link href="/collections" className="hover:text-olive-600">
            Collections
          </Link>
          <span>/</span>
          <span className="text-slate-900 font-medium">{collection.name}</span>
        </div>

        {/* Collection Header */}
        <div className="bg-white rounded-xl p-6 mb-8 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <h1 className="text-3xl font-bold text-slate-900">
                  {collection.name}
                </h1>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleToggleVisibility}
                  className="flex items-center gap-2"
                >
                  {collection.isPublic ? (
                    <>
                      <Eye className="h-4 w-4" />
                      Public
                    </>
                  ) : (
                    <>
                      <EyeOff className="h-4 w-4" />
                      Private
                    </>
                  )}
                </Button>
              </div>

              {collection.description && (
                <p className="text-slate-600 mb-4">{collection.description}</p>
              )}

              <div className="flex flex-wrap gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-slate-500" />
                  <span className="text-slate-600">{cardCount} cards</span>
                </div>
                {totalValue > 0 && (
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-slate-500" />
                    <span className="text-slate-600">
                      ${totalValue.toLocaleString()}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-slate-500" />
                  <span className="text-slate-600">0 pending deals</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-slate-500" />
                  <span className="text-slate-600">
                    Updated{" "}
                    {new Date(
                      collection.updatedAt || collection.createdAt
                    ).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleEditCollection}
                className="flex items-center gap-2"
              >
                <Edit className="h-4 w-4" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddCards}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Cards
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleImportCards}
                className="flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                Import
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportCollection}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Export
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDeleteCollection}
                className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:border-red-300"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            </div>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex-1 max-w-2xl">
              <SearchBar
                placeholder="Search cards in this collection..."
                onSearch={handleSearch}
              />
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="flex items-center gap-2"
              >
                <Grid3X3 className="h-4 w-4" />
                Grid
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="flex items-center gap-2"
              >
                <List className="h-4 w-4" />
                List
              </Button>
            </div>
          </div>
        </div>

        {/* Collection Items */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-slate-900">
              Collection Items
            </h2>
            <Badge variant="secondary">{cardCount} cards</Badge>
          </div>

          {/* Empty State */}
          <div className="text-center py-12">
            <div className="bg-slate-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-4">
              <Package className="h-12 w-12 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              No cards in this collection yet
            </h3>
            <p className="text-slate-600 mb-6">
              Start building your collection by adding cards manually or
              importing from a file.
            </p>
            <div className="flex gap-4 justify-center">
              <Button
                onClick={handleAddCards}
                className="bg-olive-600 hover:bg-olive-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Cards
              </Button>
              <Button variant="outline" onClick={handleImportCards}>
                <Upload className="h-4 w-4 mr-2" />
                Import Cards
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

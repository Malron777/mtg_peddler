"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { PriceCalculationService } from "@/src/app/services/price-calculation.service";
import { CollectionItem } from "@/src/domain/tcg/collection-item.model";
import { Collection } from "@/src/domain/tcg/collection.model";
import {
  Calendar,
  DollarSign,
  Download,
  Edit,
  Eye,
  EyeOff,
  Package,
  Plus,
  RefreshCw,
  Trash2,
  Upload,
  Users,
} from "lucide-react";

interface CollectionHeaderProps {
  collection: Collection;
  collectionItems: CollectionItem[] | null;
  priceSummary?: {
    totalValue: number;
    itemCount: number;
    lastPriceUpdate: Date;
    priceBreakdown: {
      customPrices: number;
      marketPrices: number;
      unknownPrices: number;
    };
  };
  isEditingCollection: boolean;
  editingData: {
    name: string;
    description: string;
    isPublic: boolean;
    listingType: "trade" | "sale" | "both";
  };
  updateLoading: boolean;
  onToggleVisibility: () => void;
  onEditCollection: () => void;
  onSaveCollection: () => void;
  onCancelEdit: () => void;
  onFieldChange: (field: string, value: string | boolean) => void;
  onAddCards: () => void;
  onBulkImport: () => void;
  onExportCollection: () => void;
  onDeleteCollection: () => void;
  onRefreshPrices?: () => void;
}

export function CollectionHeader({
  collection,
  collectionItems,
  priceSummary,
  isEditingCollection,
  editingData,
  updateLoading,
  onToggleVisibility,
  onEditCollection,
  onSaveCollection,
  onCancelEdit,
  onFieldChange,
  onAddCards,
  onBulkImport,
  onExportCollection,
  onDeleteCollection,
  onRefreshPrices,
}: CollectionHeaderProps) {
  // Calculate card count
  const cardCount =
    collectionItems && Array.isArray(collectionItems)
      ? collectionItems.reduce((sum, item) => sum + (item.quantity || 0), 0)
      : 0;

  // Use price summary if available, otherwise calculate from items
  const totalValue = priceSummary?.totalValue || 0;

  // Calculate collection listing type (most common among items)
  const getCollectionListingType = () => {
    if (
      !collectionItems ||
      !Array.isArray(collectionItems) ||
      collectionItems.length === 0
    ) {
      return "both";
    }

    const listingTypeCounts = collectionItems.reduce((acc, item) => {
      acc[item.listingType] = (acc[item.listingType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Return the most common listing type
    return Object.entries(listingTypeCounts).reduce((a, b) =>
      listingTypeCounts[a[0]] > listingTypeCounts[b[0]] ? a : b
    )[0] as "trade" | "sale" | "both";
  };

  const collectionListingType = getCollectionListingType();

  return (
    <div className="bg-white rounded-xl p-6 mb-8 shadow-sm">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="flex-1">
          {isEditingCollection ? (
            <>
              <div className="flex items-center gap-3 mb-4">
                <Input
                  value={editingData.name}
                  onChange={(e) => onFieldChange("name", e.target.value)}
                  className="text-3xl font-bold text-slate-900 border-none p-0 h-auto bg-transparent"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onToggleVisibility}
                  className="flex items-center gap-2"
                >
                  {editingData.isPublic ? (
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
                <Select
                  value={editingData.listingType}
                  onValueChange={(value) => onFieldChange("listingType", value)}
                >
                  <SelectTrigger className="w-auto">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="trade">🔄 Trade</SelectItem>
                    <SelectItem value="sale">💰 Sale</SelectItem>
                    <SelectItem value="both">🔄💰 Trade & Sale</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Textarea
                value={editingData.description}
                onChange={(e) => onFieldChange("description", e.target.value)}
                placeholder="Collection description..."
                className="min-h-[100px] mb-4"
              />

              <div className="flex flex-wrap gap-6 text-sm mb-4">
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

              <div className="flex gap-2">
                <Button
                  onClick={onSaveCollection}
                  disabled={updateLoading}
                  className="bg-olive-600 hover:bg-olive-700 text-white"
                >
                  {updateLoading ? "Saving..." : "Save Changes"}
                </Button>
                <Button variant="outline" onClick={onCancelEdit}>
                  Cancel
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-4">
                <h1 className="text-3xl font-bold text-slate-900">
                  {collection.name}
                </h1>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onToggleVisibility}
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
                <Badge
                  variant={
                    collectionListingType === "trade"
                      ? "default"
                      : collectionListingType === "sale"
                      ? "secondary"
                      : "outline"
                  }
                  className="flex items-center gap-1"
                >
                  {collectionListingType === "trade" && "🔄 Trade"}
                  {collectionListingType === "sale" && "💰 Sale"}
                  {collectionListingType === "both" && "🔄💰 Trade & Sale"}
                </Badge>
              </div>

              {collection.description && (
                <p className="text-slate-600 mb-4">{collection.description}</p>
              )}

              <div className="flex flex-wrap gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-slate-500" />
                  <span className="text-slate-600">{cardCount} cards</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-slate-500" />
                  <span className="text-slate-600">
                    {PriceCalculationService.formatTotalValue(totalValue)}
                  </span>
                  {priceSummary &&
                    priceSummary.priceBreakdown.unknownPrices > 0 && (
                      <Badge
                        variant="outline"
                        className="text-xs text-orange-600"
                      >
                        Some prices unknown
                      </Badge>
                    )}
                </div>
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
            </>
          )}
        </div>

        {!isEditingCollection && (
          <div className="flex flex-wrap gap-2">
            {onRefreshPrices && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRefreshPrices}
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh Prices
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={onEditCollection}
              className="flex items-center gap-2"
            >
              <Edit className="h-4 w-4" />
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onAddCards}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Cards
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onBulkImport}
              className="flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              Import
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onExportCollection}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onDeleteCollection}
              className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:border-red-300"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

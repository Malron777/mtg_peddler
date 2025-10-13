"use client";

import { Button } from "@/components/ui/button";
import { Card as UICard } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card as CardModel } from "@/src/domain/tcg/card.model";
import { CollectionItem } from "@/src/domain/tcg/collection-item.model";
import { X } from "lucide-react";
import Image from "next/image";

interface CollectionItemEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedItem: Partial<CollectionItem>) => void;
  collectionItem: CollectionItem | null;
  card: CardModel | null;
  loading?: boolean;
}

const CONDITION_OPTIONS = [
  { value: "NM", label: "Near Mint (NM)" },
  { value: "LP", label: "Lightly Played (LP)" },
  { value: "MP", label: "Moderately Played (MP)" },
  { value: "HP", label: "Heavily Played (HP)" },
  { value: "DMG", label: "Damaged (DMG)" },
];

const LISTING_TYPE_OPTIONS = [
  { value: "trade", label: "Trade Only" },
  { value: "sale", label: "Sale Only" },
  { value: "both", label: "Trade & Sale" },
];

const PRICE_SOURCE_OPTIONS = [
  { value: "tcg", label: "TCGPlayer" },
  { value: "scg", label: "Star City Games" },
  { value: "custom", label: "Custom Price" },
  { value: "mtggoldfish", label: "MTGGoldfish" },
  { value: "cardmarket", label: "Cardmarket" },
];

const LANGUAGE_OPTIONS = [
  { value: "en", label: "English" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
  { value: "it", label: "Italian" },
  { value: "pt", label: "Portuguese" },
  { value: "ru", label: "Russian" },
  { value: "ja", label: "Japanese" },
  { value: "ko", label: "Korean" },
  { value: "zhs", label: "Simplified Chinese" },
  { value: "zht", label: "Traditional Chinese" },
];

export function CollectionItemEditModal({
  isOpen,
  onClose,
  onSave,
  collectionItem,
  card,
  loading = false,
}: CollectionItemEditModalProps) {
  if (!isOpen || !collectionItem || !card) {
    return null;
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const updatedItem: Partial<CollectionItem> = {
      id: collectionItem.id,
      condition: formData.get("condition") as "NM" | "LP" | "MP" | "HP" | "DMG",
      language: formData.get("language") as string,
      isFoil: formData.get("isFoil") === "on",
      listingType: formData.get("listingType") as "trade" | "sale" | "both",
      priceSource: formData.get("priceSource") as
        | "tcg"
        | "scg"
        | "custom"
        | "mtggoldfish"
        | "cardmarket",
      customPrice: formData.get("customPrice")
        ? (formData.get("customPrice") as string)
        : null,
    };

    onSave(updatedItem);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <UICard className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-slate-900">
              Edit Card Details
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Card Preview */}
          <div className="flex gap-4 mb-6 p-4 bg-slate-50 rounded-lg">
            <div className="w-20 h-28 relative flex-shrink-0">
              <Image
                src={
                  card.imageUris?.normal ||
                  card.imageUris?.small ||
                  "/card_back.png"
                }
                alt={card.name}
                fill
                className="object-contain rounded"
                onError={(e) => {
                  e.currentTarget.src = "/card_back.png";
                }}
              />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{card.name}</h3>
              <p className="text-slate-600">
                {card.setName} ({card.setCode})
              </p>
            </div>
          </div>

          {/* Edit Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Condition */}
            <div>
              <Label htmlFor="condition" className="text-sm font-medium">
                Condition
              </Label>
              <select
                id="condition"
                name="condition"
                defaultValue={collectionItem.condition}
                className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-olive-500 focus:border-transparent"
              >
                {CONDITION_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Language */}
            <div>
              <Label htmlFor="language" className="text-sm font-medium">
                Language
              </Label>
              <select
                id="language"
                name="language"
                defaultValue={collectionItem.language}
                className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-olive-500 focus:border-transparent"
              >
                {LANGUAGE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Foil Status */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isFoil"
                name="isFoil"
                defaultChecked={collectionItem.isFoil}
                className="h-4 w-4 text-olive-600 focus:ring-olive-500 border-slate-300 rounded"
              />
              <Label htmlFor="isFoil" className="text-sm font-medium">
                Foil
              </Label>
            </div>

            {/* Listing Type */}
            <div>
              <Label htmlFor="listingType" className="text-sm font-medium">
                Listing Type
              </Label>
              <select
                id="listingType"
                name="listingType"
                defaultValue={collectionItem.listingType}
                className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-olive-500 focus:border-transparent"
              >
                {LISTING_TYPE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Source */}
            <div>
              <Label htmlFor="priceSource" className="text-sm font-medium">
                Price Source
              </Label>
              <select
                id="priceSource"
                name="priceSource"
                defaultValue={collectionItem.priceSource}
                className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-olive-500 focus:border-transparent"
              >
                {PRICE_SOURCE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Custom Price */}
            <div>
              <Label htmlFor="customPrice" className="text-sm font-medium">
                Custom Price (USD)
              </Label>
              <Input
                id="customPrice"
                name="customPrice"
                type="number"
                step="0.01"
                min="0"
                defaultValue={collectionItem.customPrice || ""}
                placeholder="Enter custom price"
                className="mt-1"
              />
              <p className="text-xs text-slate-500 mt-1">
                Leave empty to use market price from selected source
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-olive-600 hover:bg-olive-700 text-white"
                disabled={loading}
              >
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </div>
      </UICard>
    </div>
  );
}

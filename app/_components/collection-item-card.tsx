"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card as UICard } from "@/components/ui/card";
import { Card } from "@/src/domain/tcg/card.model";
import { CollectionItem } from "@/src/domain/tcg/collection-item.model";
import { Edit, Minus, Plus, RefreshCw, Trash2 } from "lucide-react";
import Image from "next/image";

interface CollectionItemCardProps {
  collectionItem: CollectionItem;
  card: Card;
  viewMode?: "grid" | "list";
  onEdit: (collectionItem: CollectionItem) => void;
  onEditVersion?: (collectionItem: CollectionItem) => void;
  onDelete: (collectionItem: CollectionItem) => void;
  onQuantityChange?: (
    collectionItem: CollectionItem,
    newQuantity: number
  ) => void;
}

export function CollectionItemCard({
  collectionItem,
  card,
  viewMode = "list",
  onEdit,
  onEditVersion,
  onDelete,
  onQuantityChange,
}: CollectionItemCardProps) {
  const getConditionColor = (condition: string) => {
    switch (condition) {
      case "NM":
        return "bg-green-100 text-green-800";
      case "LP":
        return "bg-yellow-100 text-yellow-800";
      case "MP":
        return "bg-orange-100 text-orange-800";
      case "HP":
        return "bg-red-100 text-red-800";
      case "DMG":
        return "bg-red-200 text-red-900";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleQuantityIncrease = () => {
    if (onQuantityChange) {
      onQuantityChange(collectionItem, collectionItem.quantity + 1);
    }
  };

  const handleQuantityDecrease = () => {
    if (onQuantityChange && collectionItem.quantity > 1) {
      onQuantityChange(collectionItem, collectionItem.quantity - 1);
    }
  };

  if (viewMode === "grid") {
    return (
      <UICard className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-4 h-full flex flex-col">
        {/* Card Image */}
        <div className="w-full h-40 relative">
          <Image
            src={
              card.imageUris?.normal ||
              card.imageUris?.small ||
              "/card_back.png"
            }
            alt={card.name}
            fill
            className="object-contain rounded-lg"
            onError={(e) => {
              console.log(
                "Image failed to load for card:",
                card.name,
                "imageUris:",
                card.imageUris
              );
              e.currentTarget.src = "/card_back.png";
            }}
          />
          {/* Foil indicator */}
          {collectionItem.isFoil && (
            <div className="absolute top-2 right-2 bg-yellow-400 text-black text-xs font-bold px-2 py-1 rounded">
              Foil
            </div>
          )}
        </div>

        {/* Card Details */}
        <div className="flex-1 flex flex-col">
          <div className="mb-3">
            <h3 className="font-semibold text-slate-900 mb-1 line-clamp-2 text-sm">
              {card.name}
            </h3>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary" className="text-xs">
                {card.setCode}
              </Badge>
              <Badge
                className={`text-xs ${getConditionColor(
                  collectionItem.condition
                )}`}
              >
                {collectionItem.condition}
              </Badge>
            </div>
          </div>

          {/* Quantity and Price Info */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center justify-between text-sm text-slate-600">
              <span>Quantity:</span>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleQuantityDecrease}
                  disabled={collectionItem.quantity <= 1}
                  className="h-6 w-6 p-0 text-red-600 hover:text-red-700 disabled:opacity-50"
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <span className="font-medium min-w-[20px] text-center">
                  {collectionItem.quantity}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleQuantityIncrease}
                  className="h-6 w-6 p-0 text-green-600 hover:text-green-700"
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            </div>
            {collectionItem.customPrice && (
              <div className="text-sm text-slate-600">
                <span className="font-medium">
                  ${collectionItem.customPrice}
                </span>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="mt-auto pt-3 border-t border-slate-200">
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(collectionItem)}
                className="flex-1 h-8 text-xs"
                title="Edit card details"
              >
                <Edit className="h-3 w-3 mr-1" />
                Edit
              </Button>
              {onEditVersion && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEditVersion(collectionItem)}
                  className="flex-1 h-8 text-xs"
                  title="Change card version"
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Version
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(collectionItem)}
                className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                title="Delete card"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      </UICard>
    );
  }

  // List view (table row)
  return (
    <tr className="hover:bg-slate-50 border-b border-slate-200">
      {/* Card Name */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="font-medium text-slate-900">{card.name}</span>
          {collectionItem.isFoil && (
            <Badge variant="outline" className="text-xs">
              Foil
            </Badge>
          )}
        </div>
      </td>

      {/* Set */}
      <td className="px-4 py-3">
        <Badge variant="secondary" className="text-xs">
          {card.setCode}
        </Badge>
      </td>

      {/* Condition */}
      <td className="px-4 py-3">
        <Badge
          className={`text-xs ${getConditionColor(collectionItem.condition)}`}
        >
          {collectionItem.condition}
        </Badge>
      </td>

      {/* Quantity */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleQuantityDecrease}
            disabled={collectionItem.quantity <= 1}
            className="h-6 w-6 p-0 text-red-600 hover:text-red-700 disabled:opacity-50"
          >
            <Minus className="h-3 w-3" />
          </Button>
          <span className="font-medium min-w-[20px] text-center text-sm">
            {collectionItem.quantity}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleQuantityIncrease}
            className="h-6 w-6 p-0 text-green-600 hover:text-green-700"
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>
      </td>

      {/* Price */}
      <td className="px-4 py-3">
        <span className="text-sm font-medium">
          {collectionItem.customPrice ? `$${collectionItem.customPrice}` : "-"}
        </span>
      </td>

      {/* Actions */}
      <td className="px-4 py-3">
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(collectionItem)}
            className="h-8 w-8 p-0"
            title="Edit card details"
          >
            <Edit className="h-4 w-4" />
          </Button>
          {onEditVersion && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEditVersion(collectionItem)}
              className="h-8 w-8 p-0"
              title="Change card version"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(collectionItem)}
            className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
            title="Delete card"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </td>
    </tr>
  );
}

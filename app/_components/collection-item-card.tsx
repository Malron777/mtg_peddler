"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card as UICard } from "@/components/ui/card";
import { Card } from "@/src/domain/tcg/card.model";
import { CollectionItem } from "@/src/domain/tcg/collection-item.model";
import { Edit, Trash2 } from "lucide-react";
import Image from "next/image";

interface CollectionItemCardProps {
  collectionItem: CollectionItem;
  card: Card;
  onEdit: (collectionItem: CollectionItem) => void;
  onDelete: (collectionItem: CollectionItem) => void;
}

export function CollectionItemCard({
  collectionItem,
  card,
  onEdit,
  onDelete,
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

  return (
    <UICard className="p-4 hover:shadow-md transition-shadow">
      <div className="flex gap-4">
        {/* Card Image */}
        <div className="w-20 h-28 relative flex-shrink-0">
          <Image
            src={
              card.imageUris?.normal ||
              card.imageUris?.small ||
              "/card_back.png"
            }
            alt={card.oracleId}
            fill
            className="object-contain rounded"
          />
        </div>

        {/* Card Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-sm line-clamp-2">{card.name}</h3>
            <div className="flex gap-1 ml-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(collectionItem)}
                className="h-8 w-8 p-0"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(collectionItem)}
                className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {card.setName}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {card.setCode}
              </Badge>
            </div>

            <div className="flex items-center gap-2">
              <Badge
                className={`text-xs ${getConditionColor(
                  collectionItem.condition
                )}`}
              >
                {collectionItem.condition}
              </Badge>
              {collectionItem.isFoil && (
                <Badge variant="outline" className="text-xs">
                  Foil
                </Badge>
              )}
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">
                Qty:{" "}
                <span className="font-medium">{collectionItem.quantity}</span>
              </span>
              {collectionItem.customPrice && (
                <span className="font-medium">
                  ${collectionItem.customPrice}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </UICard>
  );
}

"use client";

import { CollectionItemCard } from "@/app/_components/collection-item-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card as CardModel } from "@/src/domain/tcg/card.model";
import { CollectionItem } from "@/src/domain/tcg/collection-item.model";
import { Package, Plus, Upload } from "lucide-react";

interface CollectionItemsGridProps {
  collectionItems: CollectionItem[] | null;
  collectionCards: Map<string, CardModel>;
  viewMode: "grid" | "list";
  onEditItem: (item: CollectionItem) => void;
  onEditVersion?: (item: CollectionItem) => void;
  onDeleteItem: (item: CollectionItem) => void;
  onQuantityChange?: (item: CollectionItem, newQuantity: number) => void;
  onAddCards: () => void;
  onBulkImport: () => void;
}

export function CollectionItemsGrid({
  collectionItems,
  collectionCards,
  viewMode,
  onEditItem,
  onEditVersion,
  onDeleteItem,
  onQuantityChange,
  onAddCards,
  onBulkImport,
}: CollectionItemsGridProps) {
  const cardCount =
    collectionItems && Array.isArray(collectionItems)
      ? collectionItems.reduce((sum, item) => sum + (item.quantity || 0), 0)
      : 0;

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-slate-900">
          Collection Items
        </h2>
        <Badge variant="secondary">{cardCount} cards</Badge>
      </div>

      {collectionItems && collectionItems.length > 0 ? (
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4"
              : "space-y-4"
          }
        >
          {collectionItems.map((item) => {
            const card = collectionCards.get(item.cardScryfallId);
            if (!card) return null;

            return (
              <CollectionItemCard
                key={item.id}
                collectionItem={item}
                card={card}
                viewMode={viewMode}
                onEdit={onEditItem}
                onEditVersion={onEditVersion}
                onDelete={onDeleteItem}
                onQuantityChange={onQuantityChange}
              />
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-12">
          <div className="bg-slate-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-4">
            <Package className="h-12 w-12 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            No cards in this collection yet
          </h3>
          <p className="text-slate-600 mb-6">
            Start building your collection by adding cards manually or importing
            from a file.
          </p>
          <div className="flex gap-4 justify-center">
            <Button
              onClick={onAddCards}
              className="bg-olive-600 hover:bg-olive-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Cards
            </Button>
            <Button variant="outline" onClick={onBulkImport}>
              <Upload className="h-4 w-4 mr-2" />
              Import Cards
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScryfallCard } from "@/src/app/services/scryfall.service";
import { Plus, X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

interface CardVersionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectVersion: (card: ScryfallCard) => void;
  versions: ScryfallCard[];
  loading: boolean;
  error: string | null;
  currentCard?: ScryfallCard;
}

export function CardVersionModal({
  isOpen,
  onClose,
  onSelectVersion,
  versions,
  loading,
  error,
  currentCard,
}: CardVersionModalProps) {
  const [selectedVersion, setSelectedVersion] = useState<ScryfallCard | null>(
    currentCard || null
  );

  if (!isOpen) return null;

  const handleSelectVersion = () => {
    if (selectedVersion) {
      onSelectVersion(selectedVersion);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">Select Card Version</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {loading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-olive-600 mx-auto"></div>
              <p className="mt-2 text-slate-600">Loading versions...</p>
            </div>
          )}

          {error && (
            <div className="text-center py-8">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {!loading && !error && versions && versions.length === 0 && (
            <div className="text-center py-8">
              <p className="text-slate-600">No versions found</p>
            </div>
          )}

          {!loading && !error && versions && versions.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {versions.map((card) => (
                <Card
                  key={card.id}
                  className={`p-4 cursor-pointer transition-all ${
                    selectedVersion?.id === card.id
                      ? "ring-2 ring-olive-600 shadow-md"
                      : "hover:shadow-md"
                  }`}
                  onClick={() => setSelectedVersion(card)}
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
                    {selectedVersion?.id === card.id && (
                      <div className="flex items-center justify-center pt-2">
                        <Badge className="bg-olive-600 text-white text-xs">
                          Selected
                        </Badge>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-4 p-6 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSelectVersion}
            disabled={!selectedVersion}
            className="bg-olive-600 hover:bg-olive-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Select Version
          </Button>
        </div>
      </div>
    </div>
  );
}

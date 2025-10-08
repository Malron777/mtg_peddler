"use client";

import { CardVersionModal } from "@/app/_components/card-version-modal";
import { CollectionItemCard } from "@/app/_components/collection-item-card";
import { SearchBar } from "@/app/_components/search-bar";
import { useCards } from "@/app/lib/hooks/card/use-cards.hook";
import {
  useCollectionItems,
  useGetAllCollectionItemsForCollection,
} from "@/app/lib/hooks/collection/use-collection-items.hook";
import { useGetCollection } from "@/app/lib/hooks/collection/use-collections-data.hook";
import {
  useBulkImport,
  useCardVersions,
  useScryfallSearch,
} from "@/app/lib/hooks/scryfall/use-scryfall.hook";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScryfallCard } from "@/src/app/services/scryfall.service";
import { Card as CardModel } from "@/src/domain/tcg/card.model";
import { CollectionItem } from "@/src/domain/tcg/collection-item.model";
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
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { useEffect, useState } from "react";

interface CollectionDetailClientProps {
  collectionId: string;
}

export function CollectionDetailClient({
  collectionId,
}: CollectionDetailClientProps) {
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
  const { createCollectionItem, updateCollectionItem, deleteCollectionItem } =
    useCollectionItems();
  const { createCard } = useCards();
  const {
    searchCards,
    cards: searchResults,
    loading: searchLoading,
    error: searchError,
  } = useScryfallSearch();
  const {
    getCardVersions,
    versions,
    loading: versionsLoading,
    error: versionsError,
  } = useCardVersions();
  const {
    bulkImport,
    loading: bulkImportLoading,
    error: bulkImportError,
  } = useBulkImport();

  // State management
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showCardSearchPanel, setShowCardSearchPanel] = useState(false);
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [showVersionModal, setShowVersionModal] = useState(false);
  const [editingItem, setEditingItem] = useState<CollectionItem | null>(null);
  const [bulkImportText, setBulkImportText] = useState("");
  const [isEditingCollection, setIsEditingCollection] = useState(false);
  const [collectionCards, setCollectionCards] = useState<
    Map<string, CardModel>
  >(new Map());

  // Load collection and items on component mount
  useEffect(() => {
    getCollection(collectionId);
    getAllCollectionItemsForCollection(collectionId);
  }, [collectionId, getCollection, getAllCollectionItemsForCollection]);

  // Load card data for collection items
  useEffect(() => {
    if (collectionItems) {
      const cardPromises = collectionItems.map(async (item) => {
        try {
          const response = await fetch(`/api/cards/${item.cardScryfallId}`);
          const result = await response.json();
          if (result.success) {
            return { scryfallId: item.cardScryfallId, card: result.card };
          }
        } catch (error) {
          console.error(`Failed to load card ${item.cardScryfallId}:`, error);
        }
        return null;
      });

      Promise.all(cardPromises).then((results) => {
        const cardMap = new Map<string, CardModel>();
        results.forEach((result) => {
          if (result) {
            cardMap.set(result.scryfallId, result.card);
          }
        });
        setCollectionCards(cardMap);
      });
    }
  }, [collectionItems]);

  // Show loading state
  if (collectionLoading || itemsLoading || !collection) {
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
  if (collectionError || itemsError) {
    notFound();
  }

  // Calculate card count and value
  const cardCount =
    collectionItems && Array.isArray(collectionItems)
      ? collectionItems.reduce((sum, item) => sum + (item.quantity || 0), 0)
      : 0;
  const totalValue =
    collectionItems && Array.isArray(collectionItems)
      ? collectionItems.reduce((sum) => {
          // TODO: Calculate actual value based on card prices
          return sum + 0; // Placeholder
        }, 0)
      : 0;

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

  const handleSearch = (query: string) => {
    if (query.trim()) {
      searchCards(query);
      setShowCardSearchPanel(true);
    }
  };

  const handleSelectCard = async (card: ScryfallCard) => {
    try {
      // First, ensure the card exists in our database
      await createCard({
        scryfallId: card.id,
        oracleId: card.oracle_id,
        name: card.name,
        setCode: card.set,
        setName: card.set_name,
        imageUris: card.image_uris,
        cachedData: card as unknown as Record<string, unknown>,
      });

      // Create collection item
      await createCollectionItem({
        id: crypto.randomUUID(),
        collectionId: collectionId,
        cardScryfallId: card.id,
        quantity: 1,
        condition: "NM",
        language: "en",
        isFoil: false,
        listingType: "both",
        priceSource: "tcg",
      });

      // Refresh collection items
      getAllCollectionItemsForCollection(collectionId);
      setShowCardSearchPanel(false);
    } catch (error) {
      console.error("Failed to add card:", error);
    }
  };

  const handleEditItem = (item: CollectionItem) => {
    setEditingItem(item);
    // Load card versions for editing
    const card = collectionCards.get(item.cardScryfallId);
    if (card) {
      getCardVersions(card.oracleId);
      setShowVersionModal(true);
    }
  };

  const handleSelectVersion = async (card: ScryfallCard) => {
    if (!editingItem) return;

    try {
      // Update the collection item with new card version
      await updateCollectionItem({
        id: editingItem.id,
        cardScryfallId: card.id,
        quantity: editingItem.quantity,
        condition: editingItem.condition,
        language: editingItem.language,
        isFoil: editingItem.isFoil,
        listingType: editingItem.listingType,
        customPrice: editingItem.customPrice,
        priceSource: editingItem.priceSource,
      });

      // Refresh collection items
      getAllCollectionItemsForCollection(collectionId);
      setShowVersionModal(false);
      setEditingItem(null);
    } catch (error) {
      console.error("Failed to update card version:", error);
    }
  };

  const handleDeleteItem = async (item: CollectionItem) => {
    if (
      confirm("Are you sure you want to delete this card from the collection?")
    ) {
      try {
        await deleteCollectionItem(item.id);
        getAllCollectionItemsForCollection(collectionId);
      } catch (error) {
        console.error("Failed to delete collection item:", error);
      }
    }
  };

  const handleBulkImport = async () => {
    if (!bulkImportText.trim()) return;

    const lines = bulkImportText.split("\n").filter((line) => line.trim());
    const items = lines.map((line) => {
      // Parse format: "2x Lightning Bolt" or "2 Lightning Bolt"
      const match = line.match(/^(\d+)(?:x)?\s+(.+)$/);
      if (match) {
        return {
          quantity: parseInt(match[1]),
          cardName: match[2].trim(),
        };
      }
      return {
        quantity: 1,
        cardName: line.trim(),
      };
    });

    try {
      const result = await bulkImport(collectionId, items);
      if (result) {
        getAllCollectionItemsForCollection(collectionId);
        setBulkImportText("");
        setShowBulkImport(false);
      }
    } catch (error) {
      console.error("Failed to bulk import:", error);
    }
  };

  const handleToggleVisibility = async () => {
    // TODO: Implement visibility toggle
    console.log("Toggle visibility");
  };

  const handleEditCollection = () => {
    setIsEditingCollection(true);
  };

  const handleSaveCollection = async () => {
    // TODO: Implement collection update
    setIsEditingCollection(false);
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
              {isEditingCollection ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Input
                      defaultValue={collection.name}
                      className="text-2xl font-bold border-none p-0 h-auto"
                    />
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
                  <Textarea
                    defaultValue={collection.description || ""}
                    placeholder="Collection description..."
                    className="min-h-[100px]"
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={handleSaveCollection}
                      className="bg-olive-600 hover:bg-olive-700 text-white"
                    >
                      Save Changes
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setIsEditingCollection(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <>
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
                    <p className="text-slate-600 mb-4">
                      {collection.description}
                    </p>
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
                </>
              )}
            </div>

            {!isEditingCollection && (
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
                  onClick={() => setShowCardSearchPanel(!showCardSearchPanel)}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Cards
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowBulkImport(!showBulkImport)}
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
            )}
          </div>
        </div>

        {/* Bulk Import Section */}
        {showBulkImport && (
          <div className="bg-white rounded-xl p-6 mb-8 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Bulk Import Cards</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowBulkImport(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="bulk-import">Card List</Label>
                <Textarea
                  id="bulk-import"
                  placeholder="Enter cards in the format:&#10;2x Lightning Bolt&#10;1x Black Lotus&#10;3 Counterspell"
                  value={bulkImportText}
                  onChange={(e) => setBulkImportText(e.target.value)}
                  className="min-h-[120px]"
                />
                <p className="text-sm text-slate-600 mt-2">
                  Format: quantity (optional &quot;x&quot;) card name, one per
                  line
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleBulkImport}
                  disabled={!bulkImportText.trim() || bulkImportLoading}
                  className="bg-olive-600 hover:bg-olive-700 text-white"
                >
                  {bulkImportLoading ? "Importing..." : "Import Cards"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowBulkImport(false)}
                >
                  Cancel
                </Button>
              </div>
              {bulkImportError && (
                <p className="text-red-600 text-sm">{bulkImportError}</p>
              )}
            </div>
          </div>
        )}

        {/* Card Search Panel */}
        {showCardSearchPanel && (
          <div className="bg-white rounded-xl p-6 mb-8 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Add Cards to Collection</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCardSearchPanel(false)}
              >
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
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleSearch(e.currentTarget.value);
                      }
                    }}
                    className="flex-1"
                  />
                  <Button
                    onClick={() => {
                      const input = document.getElementById(
                        "card-search"
                      ) as HTMLInputElement;
                      if (input?.value) {
                        handleSearch(input.value);
                      }
                    }}
                    className="bg-olive-600 hover:bg-olive-700 text-white"
                  >
                    Search
                  </Button>
                </div>
              </div>

              {searchLoading && (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-olive-600 mx-auto"></div>
                  <p className="mt-2 text-slate-600">Searching cards...</p>
                </div>
              )}

              {searchError && (
                <div className="text-center py-8">
                  <p className="text-red-600">{searchError}</p>
                </div>
              )}

              {!searchLoading &&
                !searchError &&
                searchResults &&
                searchResults.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-slate-600">
                      No cards found. Try a different search term.
                    </p>
                  </div>
                )}

              {!searchLoading &&
                !searchError &&
                searchResults &&
                searchResults.length > 0 && (
                  <div>
                    <p className="text-sm text-slate-600 mb-4">
                      Found {searchResults.length} cards. Click on a card to add
                      it to your collection:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                      {searchResults.map((card) => (
                        <div
                          key={card.id}
                          className="p-4 border rounded-lg cursor-pointer hover:shadow-md transition-shadow"
                          onClick={() => handleSelectCard(card)}
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
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          </div>
        )}

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

          {collectionItems && collectionItems.length > 0 ? (
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
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
                    onEdit={handleEditItem}
                    onDelete={handleDeleteItem}
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
                Start building your collection by adding cards manually or
                importing from a file.
              </p>
              <div className="flex gap-4 justify-center">
                <Button
                  onClick={() => setShowCardSearchPanel(true)}
                  className="bg-olive-600 hover:bg-olive-700 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Cards
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowBulkImport(true)}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Import Cards
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <CardVersionModal
        isOpen={showVersionModal}
        onClose={() => {
          setShowVersionModal(false);
          setEditingItem(null);
        }}
        onSelectVersion={handleSelectVersion}
        versions={versions || []}
        loading={versionsLoading}
        error={versionsError}
        currentCard={undefined}
      />
    </div>
  );
}

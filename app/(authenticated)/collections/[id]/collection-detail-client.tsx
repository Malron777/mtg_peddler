"use client";

import { CardVersionModal } from "@/app/_components/card-version-modal";
import { BulkImportPanel } from "@/app/_components/collection/bulk-import-panel";
import { CardSearchPanel } from "@/app/_components/collection/card-search-panel";
import { CollectionHeader } from "@/app/_components/collection/collection-header";
import { CollectionItemsGrid } from "@/app/_components/collection/collection-items-grid";
import { CollectionSearchBar } from "@/app/_components/collection/collection-search-bar";
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
import { ScryfallCard } from "@/src/app/services/scryfall.service";
import { Card as CardModel } from "@/src/domain/tcg/card.model";
import { CollectionItem } from "@/src/domain/tcg/collection-item.model";
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
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredCollectionItems, setFilteredCollectionItems] = useState<
    CollectionItem[] | null
  >(null);

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
            console.log(
              "Loaded card:",
              result.card.name,
              "imageUris:",
              result.card.imageUris
            );
            cardMap.set(result.scryfallId, result.card);
          }
        });
        setCollectionCards(cardMap);
      });
    }
  }, [collectionItems]);

  // Filter collection items based on search query
  useEffect(() => {
    if (!collectionItems) {
      setFilteredCollectionItems(null);
      return;
    }

    if (!searchQuery.trim()) {
      setFilteredCollectionItems(collectionItems);
      return;
    }

    const filtered = collectionItems.filter((item) => {
      const card = collectionCards.get(item.cardScryfallId);
      if (!card) return false;

      const searchLower = searchQuery.toLowerCase();
      return (
        card.name.toLowerCase().includes(searchLower) ||
        card.setName.toLowerCase().includes(searchLower) ||
        card.setCode.toLowerCase().includes(searchLower) ||
        item.condition.toLowerCase().includes(searchLower)
      );
    });

    setFilteredCollectionItems(filtered);
  }, [collectionItems, collectionCards, searchQuery]);

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

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleAddCardsSearch = (query: string) => {
    if (query.trim()) {
      searchCards(query);
      setShowCardSearchPanel(true);
    }
  };

  const handleSelectCard = async (card: ScryfallCard) => {
    try {
      console.log("Creating card with data:", {
        scryfallId: card.id,
        name: card.name,
        imageUris: card.image_uris,
        imageStatus: card.image_status,
      });

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
        <CollectionHeader
          collection={collection}
          collectionItems={collectionItems}
          isEditingCollection={isEditingCollection}
          onToggleVisibility={handleToggleVisibility}
          onEditCollection={handleEditCollection}
          onSaveCollection={handleSaveCollection}
          onCancelEdit={() => setIsEditingCollection(false)}
          onAddCards={() => setShowCardSearchPanel(true)}
          onBulkImport={() => setShowBulkImport(true)}
          onExportCollection={handleExportCollection}
          onDeleteCollection={handleDeleteCollection}
        />

        {/* Bulk Import Panel */}
        <BulkImportPanel
          isOpen={showBulkImport}
          bulkImportText={bulkImportText}
          loading={bulkImportLoading}
          error={bulkImportError}
          onClose={() => setShowBulkImport(false)}
          onTextChange={setBulkImportText}
          onImport={handleBulkImport}
        />

        {/* Card Search Panel */}
        <CardSearchPanel
          isOpen={showCardSearchPanel}
          searchResults={searchResults}
          loading={searchLoading}
          error={searchError}
          onClose={() => setShowCardSearchPanel(false)}
          onSearch={handleAddCardsSearch}
          onSelectCard={handleSelectCard}
        />

        {/* Search and Filter Bar */}
        <CollectionSearchBar
          viewMode={viewMode}
          onSearch={handleSearch}
          onViewModeChange={setViewMode}
        />

        {/* Collection Items */}
        <CollectionItemsGrid
          collectionItems={filteredCollectionItems}
          collectionCards={collectionCards}
          viewMode={viewMode}
          onEditItem={handleEditItem}
          onDeleteItem={handleDeleteItem}
          onAddCards={() => setShowCardSearchPanel(true)}
          onBulkImport={() => setShowBulkImport(true)}
        />
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

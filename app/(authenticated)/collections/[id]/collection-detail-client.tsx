"use client";

import { CardVersionModal } from "@/app/_components/card-version-modal";
import { BulkImportPanel } from "@/app/_components/collection/bulk-import-panel";
import { CardSearchPanel } from "@/app/_components/collection/card-search-panel";
import { CollectionHeader } from "@/app/_components/collection/collection-header";
import { CollectionItemEditModal } from "@/app/_components/collection/collection-item-edit-modal";
import { CollectionItemsGrid } from "@/app/_components/collection/collection-items-grid";
import { CollectionSearchBar } from "@/app/_components/collection/collection-search-bar";
import {
  useCards,
  useGetAllCardsForCollection,
} from "@/app/lib/hooks/card/use-cards.hook";
import {
  scryfallCardToChangeRequest,
  useChangeCardVersion,
} from "@/app/lib/hooks/collection/use-change-card-version.hook";
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
import { parseBulkImportText } from "@/app/lib/utils/bulk-import-parser";
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
    loading: itemsLoading,
    error: itemsError,
    getAllCollectionItemsForCollection,
  } = useGetAllCollectionItemsForCollection();
  const { createCollectionItem, updateCollectionItem, deleteCollectionItem } =
    useCollectionItems();
  const { createCard } = useCards();
  const {
    cards: collectionCardsData,
    loading: cardsLoading,
    error: cardsError,
    getAllCardsForCollection,
  } = useGetAllCardsForCollection();
  const { changeCardVersion } = useChangeCardVersion();
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
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState<CollectionItem | null>(null);
  const [bulkImportText, setBulkImportText] = useState("");
  const [isEditingCollection, setIsEditingCollection] = useState(false);
  const [collectionCards, setCollectionCards] = useState<
    Map<string, CardModel>
  >(new Map());
  const [searchQuery, setSearchQuery] = useState("");
  const [localCollectionItems, setLocalCollectionItems] = useState<
    CollectionItem[] | null
  >(null);
  const [filteredCollectionItems, setFilteredCollectionItems] = useState<
    CollectionItem[] | null
  >(null);
  const [shouldRefetchItems, setShouldRefetchItems] = useState(false);

  // Load collection and items on component mount
  useEffect(() => {
    getCollection(collectionId);
    const loadItems = async () => {
      const items = await getAllCollectionItemsForCollection(collectionId);
      setLocalCollectionItems(items);
    };
    loadItems();
  }, [collectionId, getCollection, getAllCollectionItemsForCollection]);

  // Load cards for collection in bulk
  useEffect(() => {
    if (collectionId) {
      getAllCardsForCollection(collectionId, { pageSize: 1000 }); // Get all cards at once
    }
  }, [collectionId, getAllCardsForCollection]);

  // Convert bulk cards data to map for easy lookup
  useEffect(() => {
    if (collectionCardsData) {
      const cardMap = new Map<string, CardModel>();
      collectionCardsData.forEach((card) => {
        console.log("Loaded card:", card.name, "imageUris:", card.imageUris);
        cardMap.set(card.scryfallId, card);
      });
      setCollectionCards(cardMap);
    }
  }, [collectionCardsData]);

  // Refetch collection items and cards when bulk import is complete
  useEffect(() => {
    if (shouldRefetchItems) {
      console.log("Refetching collection items and cards after bulk import...");
      const refetchData = async () => {
        const items = await getAllCollectionItemsForCollection(collectionId);
        console.log("Refetched collection items:", items?.length || 0, "items");
        console.log("Refetched items:", items);
        setLocalCollectionItems(items);

        // Also refetch cards
        await getAllCardsForCollection(collectionId, { pageSize: 1000 });

        setShouldRefetchItems(false);
      };
      refetchData();
    }
  }, [
    shouldRefetchItems,
    collectionId,
    getAllCollectionItemsForCollection,
    getAllCardsForCollection,
  ]);

  // Filter collection items based on search query
  useEffect(() => {
    if (!localCollectionItems) {
      setFilteredCollectionItems(null);
      return;
    }

    if (!searchQuery.trim()) {
      setFilteredCollectionItems(localCollectionItems);
      return;
    }

    const filtered = localCollectionItems.filter((item) => {
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
  }, [localCollectionItems, collectionCards, searchQuery]);

  // Show loading state
  if (collectionLoading || itemsLoading || cardsLoading || !collection) {
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
  if (collectionError || itemsError || cardsError) {
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
      const result = await createCollectionItem({
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

      // Optimistically update local state instead of refetching
      if (result && result.collectionItem) {
        const newItem = result.collectionItem;
        const newCard: CardModel = {
          scryfallId: card.id,
          oracleId: card.oracle_id,
          name: card.name,
          setCode: card.set,
          setName: card.set_name,
          imageUris: card.image_uris || null,
          pricesLastUpdated: null,
          cachedData: card as unknown as Record<string, unknown>,
          lastFetchedAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        // Update collection items state
        setLocalCollectionItems((prev) =>
          prev ? [...prev, newItem] : [newItem]
        );

        // Update collection cards state
        setCollectionCards((prev) => new Map(prev).set(card.id, newCard));
      }

      setShowCardSearchPanel(false);
    } catch (error) {
      console.error("Failed to add card:", error);
    }
  };

  const handleEditItem = (item: CollectionItem) => {
    setEditingItem(item);
    setShowEditModal(true);
  };

  const handleEditVersion = (item: CollectionItem) => {
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
      console.log("=== NEW VERSION CHANGE METHOD ===");
      console.log(
        "Changing card version from",
        editingItem.cardScryfallId,
        "to",
        card.id
      );

      const changeRequest = scryfallCardToChangeRequest(card, editingItem.id);
      console.log("Change request:", changeRequest);

      const result = await changeCardVersion(changeRequest);
      console.log("Change result:", result);

      if (!result || !result.success) {
        throw new Error(result?.error || "Failed to change card version");
      }

      console.log("Card version changed successfully");

      // Update local state with the new collection item
      if (result.newCollectionItem) {
        const newCard: CardModel = {
          scryfallId: card.id,
          oracleId: card.oracle_id,
          name: card.name,
          setCode: card.set,
          setName: card.set_name,
          imageUris: card.image_uris || null,
          pricesLastUpdated: null,
          cachedData: card as unknown as Record<string, unknown>,
          lastFetchedAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        // Remove the old item and add the new one
        setLocalCollectionItems((prev) =>
          prev
            ? prev
                .filter((i) => i.id !== editingItem.id)
                .concat(result.newCollectionItem!)
            : [result.newCollectionItem!]
        );

        // Update collection cards state
        setCollectionCards((prev) => new Map(prev).set(card.id, newCard));
      }

      setShowVersionModal(false);
      setEditingItem(null);
    } catch (error) {
      console.error("Failed to change card version:", error);
      // Show user-friendly error message
      alert(
        `Failed to change card version: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };

  const handleDeleteItem = async (item: CollectionItem) => {
    if (
      confirm("Are you sure you want to delete this card from the collection?")
    ) {
      // Optimistically remove from UI first
      const originalItems = localCollectionItems;
      setLocalCollectionItems((prev) =>
        prev ? prev.filter((i) => i.id !== item.id) : null
      );

      try {
        await deleteCollectionItem(item.id);
        // Success - item is already removed from UI
      } catch (error) {
        console.error("Failed to delete collection item:", error);
        // Revert optimistic update on error
        setLocalCollectionItems(originalItems);
      }
    }
  };

  const handleQuantityChange = async (
    item: CollectionItem,
    newQuantity: number
  ) => {
    console.log("=== QUANTITY CHANGE METHOD ===");
    console.log("Changing quantity for item:", item.id, "to:", newQuantity);

    // Optimistically update the UI first
    const updatedItem = { ...item, quantity: newQuantity };
    setLocalCollectionItems((prev) =>
      prev ? prev.map((i) => (i.id === item.id ? updatedItem : i)) : null
    );

    try {
      const result = await updateCollectionItem({
        id: item.id,
        collectionId: collectionId,
        cardScryfallId: item.cardScryfallId,
        quantity: newQuantity,
        condition: item.condition,
        language: item.language,
        isFoil: item.isFoil,
        listingType: item.listingType,
        customPrice: item.customPrice,
        priceSource: item.priceSource,
      });

      // Update with the actual result from server
      if (result && result.collectionItem) {
        setLocalCollectionItems((prev) =>
          prev
            ? prev.map((i) => (i.id === item.id ? result.collectionItem : i))
            : null
        );
      }
    } catch (error) {
      console.error("Failed to update quantity:", error);
      // Revert optimistic update on error
      setLocalCollectionItems((prev) =>
        prev ? prev.map((i) => (i.id === item.id ? item : i)) : null
      );
    }
  };

  const handleSaveItemDetails = async (
    updatedData: Partial<CollectionItem>
  ) => {
    if (!editingItem) return;

    console.log("=== SAVE ITEM DETAILS METHOD ===");
    console.log("Updating item:", editingItem.id, "with data:", updatedData);

    // Optimistically update the UI first
    const updatedItem = { ...editingItem, ...updatedData };
    setLocalCollectionItems((prev) =>
      prev ? prev.map((i) => (i.id === editingItem.id ? updatedItem : i)) : null
    );

    try {
      const result = await updateCollectionItem({
        id: editingItem.id,
        collectionId: collectionId,
        cardScryfallId: editingItem.cardScryfallId,
        quantity: editingItem.quantity,
        condition: updatedData.condition || editingItem.condition,
        language: updatedData.language || editingItem.language,
        isFoil:
          updatedData.isFoil !== undefined
            ? updatedData.isFoil
            : editingItem.isFoil,
        listingType: updatedData.listingType || editingItem.listingType,
        customPrice:
          updatedData.customPrice !== undefined
            ? updatedData.customPrice
            : editingItem.customPrice,
        priceSource: updatedData.priceSource || editingItem.priceSource,
      });

      // Update with the actual result from server
      if (result && result.collectionItem) {
        setLocalCollectionItems((prev) =>
          prev
            ? prev.map((i) =>
                i.id === editingItem.id ? result.collectionItem : i
              )
            : null
        );
      }

      setShowEditModal(false);
      setEditingItem(null);
    } catch (error) {
      console.error("Failed to update item details:", error);
      // Revert optimistic update on error
      setLocalCollectionItems((prev) =>
        prev
          ? prev.map((i) => (i.id === editingItem.id ? editingItem : i))
          : null
      );
      // Show user-friendly error message
      alert(
        `Failed to update card details: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };

  const handleBulkImport = async () => {
    if (!bulkImportText.trim()) return;

    const items = parseBulkImportText(bulkImportText);

    try {
      const result = await bulkImport(collectionId, items);
      if (result && result.results) {
        // Trigger refetch of collection items
        setShouldRefetchItems(true);

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
          collectionItems={localCollectionItems}
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
          onEditVersion={handleEditVersion}
          onDeleteItem={handleDeleteItem}
          onQuantityChange={handleQuantityChange}
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

      <CollectionItemEditModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingItem(null);
        }}
        onSave={handleSaveItemDetails}
        collectionItem={editingItem}
        card={
          editingItem
            ? collectionCards.get(editingItem.cardScryfallId) || null
            : null
        }
        loading={false}
      />
    </div>
  );
}

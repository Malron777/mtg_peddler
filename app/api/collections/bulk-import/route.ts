import { getCurrentUser } from "@/app/auth-actions";
import {
  ScryfallSearchResult,
  ScryfallService,
} from "@/src/app/services/scryfall.service";
import { dependencies } from "@/src/config/dependencies";
import { InsertCard } from "@/src/domain/tcg/card.model";
import { InsertCollectionItem } from "@/src/domain/tcg/collection-item.model";
import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";

interface BulkImportItem {
  quantity: number;
  cardName: string;
}

interface ScryfallCollectionRequest {
  identifiers: Array<{
    name: string;
  }>;
}

interface BulkImportResult {
  success: boolean;
  results: Array<{
    cardName: string;
    success: boolean;
    collectionItem?: any;
    error?: string;
  }>;
  summary: {
    total: number;
    successful: number;
    failed: number;
  };
}

export async function POST(
  request: NextRequest
): Promise<NextResponse<BulkImportResult | { error: string }>> {
  try {
    // 1. Authentication check
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Parse and validate request body
    const body = await request.json();
    const {
      collectionId,
      items,
    }: { collectionId: string; items: BulkImportItem[] } = body;

    if (!collectionId || !items || !Array.isArray(items)) {
      return NextResponse.json(
        { error: "Collection ID and items array are required" },
        { status: 400 }
      );
    }

    if (items.length === 0) {
      return NextResponse.json({
        success: true,
        results: [],
        summary: { total: 0, successful: 0, failed: 0 },
      });
    }

    // 3. Validate collection exists and belongs to user
    const collectionResult =
      await dependencies.useCases.collections.getCollection(collectionId);
    if (!collectionResult.success || !collectionResult.collection) {
      return NextResponse.json(
        { error: "Collection not found" },
        { status: 404 }
      );
    }

    if (collectionResult.collection.userId !== user.id) {
      return NextResponse.json(
        { error: "Access denied to this collection" },
        { status: 403 }
      );
    }

    // 4. Process items individually to ensure proper error handling
    const scryfallService = new ScryfallService();
    const results: Array<{
      cardName: string;
      success: boolean;
      collectionItem?: any;
      error?: string;
    }> = [];

    for (const item of items) {
      try {
        // 5. Search for card by name
        const searchResult =
          await scryfallService.makeRequest<ScryfallSearchResult>(
            `/cards/search?q=!"${encodeURIComponent(item.cardName)}"&order=name`
          );

        if (!searchResult.data || searchResult.data.length === 0) {
          results.push({
            cardName: item.cardName,
            success: false,
            error: "Card not found",
          });
          continue;
        }

        const scryfallCard = searchResult.data[0];

        // 6. Ensure card exists in database
        let cardResult = await dependencies.useCases.cards.getCard(
          scryfallCard.id
        );
        let card = cardResult.success ? cardResult.card : null;
        if (!card) {
          // For 2-faced cards, use the first face's image_uris if main image_uris is null
          const imageUris =
            scryfallCard.image_uris ||
            scryfallCard.card_faces?.[0]?.image_uris ||
            null;

          const insertCard: InsertCard = {
            scryfallId: scryfallCard.id,
            oracleId: scryfallCard.oracle_id,
            name: scryfallCard.name,
            setCode: scryfallCard.set,
            setName: scryfallCard.set_name,
            imageUris: imageUris,
            cachedData: scryfallCard as unknown as Record<string, unknown>,
          };

          const cardResult = await dependencies.useCases.cards.createCard(
            insertCard
          );
          if (!cardResult.success || !cardResult.card) {
            results.push({
              cardName: item.cardName,
              success: false,
              error: "Failed to create card in database",
            });
            continue;
          }
          card = cardResult.card;
        }

        // 7. Create collection item
        const insertCollectionItem: InsertCollectionItem = {
          id: randomUUID(),
          collectionId: collectionId,
          cardScryfallId: scryfallCard.id,
          quantity: item.quantity,
          condition: "NM",
          language: "en",
          isFoil: false,
          listingType: "both",
          priceSource: "tcg",
        };

        const collectionItemResult =
          await dependencies.useCases.collectionItems.createCollectionItem(
            insertCollectionItem
          );

        if (
          collectionItemResult.success &&
          collectionItemResult.collectionItem
        ) {
          results.push({
            cardName: item.cardName,
            success: true,
            collectionItem: collectionItemResult.collectionItem,
          });
        } else {
          results.push({
            cardName: item.cardName,
            success: false,
            error:
              collectionItemResult.error || "Failed to create collection item",
          });
        }
      } catch (error) {
        results.push({
          cardName: item.cardName,
          success: false,
          error:
            error instanceof Error ? error.message : "Unknown error occurred",
        });
      }
    }

    // 8. Calculate summary
    const successful = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success).length;

    return NextResponse.json({
      success: true,
      results,
      summary: {
        total: items.length,
        successful,
        failed,
      },
    });
  } catch (error) {
    console.error("Error in bulk import:", error);
    return NextResponse.json(
      { error: "Internal server error during bulk import" },
      { status: 500 }
    );
  }
}

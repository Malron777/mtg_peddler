import { getCurrentUser } from "@/app/auth-actions";
import {
  ScryfallCard,
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

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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

    const scryfallService = new ScryfallService();
    const results = [];
    const errors = [];

    // Process items in batches of 75 (Scryfall's limit for collection endpoint)
    const batchSize = 75;
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);

      try {
        // Use Scryfall's collection endpoint for bulk card lookup
        const collectionRequest: ScryfallCollectionRequest = {
          identifiers: batch.map((item) => ({ name: item.cardName })),
        };

        const foundCards = await scryfallService.getCardCollection(
          collectionRequest.identifiers
        );

        // Process found cards

        // Process each item in the batch
        for (const item of batch) {
          try {
            // Find the card in the batch results
            const scryfallCard = foundCards.find(
              (card: ScryfallCard) =>
                card.name.toLowerCase() === item.cardName.toLowerCase()
            );

            if (!scryfallCard) {
              errors.push({
                cardName: item.cardName,
                error: "Card not found",
              });
              continue;
            }

            // Check if card already exists in database
            let card = await dependencies.useCases.cards.getCard(
              scryfallCard.id
            );

            if (!card) {
              // Create card if it doesn't exist
              const insertCard: InsertCard = {
                scryfallId: scryfallCard.id,
                oracleId: scryfallCard.oracle_id,
                name: scryfallCard.name,
                setCode: scryfallCard.set,
                setName: scryfallCard.set_name,
                imageUris: scryfallCard.image_uris,
                cachedData: scryfallCard,
              };

              card = await dependencies.useCases.cards.createCard(insertCard);
            }

            // Create collection item
            const insertCollectionItem: InsertCollectionItem = {
              id: randomUUID(),
              collectionId,
              cardScryfallId: scryfallCard.id,
              quantity: item.quantity,
              condition: "NM",
              language: "en",
              isFoil: false,
              listingType: "both",
              priceSource: "tcg",
            };

            const collectionItem =
              await dependencies.useCases.collectionItems.createCollectionItem(
                insertCollectionItem
              );

            results.push({
              cardName: item.cardName,
              card: card,
              collectionItem: collectionItem,
            });
          } catch (error) {
            errors.push({
              cardName: item.cardName,
              error: error instanceof Error ? error.message : "Unknown error",
            });
          }
        }
      } catch (error) {
        // If bulk request fails, fall back to individual requests
        console.warn(
          "Bulk request failed, falling back to individual requests:",
          error
        );

        for (const item of batch) {
          try {
            // Search for the card by name (fallback method)
            const searchResult =
              await scryfallService.makeRequest<ScryfallSearchResult>(
                `/cards/search?q=${encodeURIComponent(
                  item.cardName
                )}&order=name`
              );

            if (!searchResult.data || searchResult.data.length === 0) {
              errors.push({
                cardName: item.cardName,
                error: "Card not found",
              });
              continue;
            }

            // Use the first result (most relevant)
            const scryfallCard = searchResult.data[0];

            // Check if card already exists in database
            let card = await dependencies.useCases.cards.getCard(
              scryfallCard.id
            );

            if (!card) {
              // Create card if it doesn't exist
              const insertCard: InsertCard = {
                scryfallId: scryfallCard.id,
                oracleId: scryfallCard.oracle_id,
                name: scryfallCard.name,
                setCode: scryfallCard.set,
                setName: scryfallCard.set_name,
                imageUris: scryfallCard.image_uris,
                cachedData: scryfallCard,
              };

              card = await dependencies.useCases.cards.createCard(insertCard);
            }

            // Create collection item
            const insertCollectionItem: InsertCollectionItem = {
              id: randomUUID(),
              collectionId,
              cardScryfallId: scryfallCard.id,
              quantity: item.quantity,
              condition: "NM",
              language: "en",
              isFoil: false,
              listingType: "both",
              priceSource: "tcg",
            };

            const collectionItem =
              await dependencies.useCases.collectionItems.createCollectionItem(
                insertCollectionItem
              );

            results.push({
              cardName: item.cardName,
              card: card,
              collectionItem: collectionItem,
            });
          } catch (error) {
            errors.push({
              cardName: item.cardName,
              error: error instanceof Error ? error.message : "Unknown error",
            });
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      results,
      errors,
      summary: {
        total: items.length,
        successful: results.length,
        failed: errors.length,
      },
    });
  } catch (error) {
    console.error("Error bulk importing cards:", error);
    return NextResponse.json(
      { error: "Failed to bulk import cards" },
      { status: 500 }
    );
  }
}

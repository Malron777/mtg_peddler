import { getCurrentUser } from "@/app/auth-actions";
import { ScryfallService } from "@/src/app/services/scryfall.service";
import { dependencies } from "@/src/config/dependencies";
import { InsertCard } from "@/src/domain/tcg/card.model";
import { InsertCollectionItem } from "@/src/domain/tcg/collection-item.model";
import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";

interface BulkImportItem {
  quantity: number;
  cardName: string;
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

    for (const item of items) {
      try {
        // Search for the card by name
        const searchResult = await scryfallService.makeRequest<any>(
          `/cards/search?q=${encodeURIComponent(item.cardName)}&order=name`
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
        let card = await dependencies.useCases.cards.getCard(scryfallCard.id);

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

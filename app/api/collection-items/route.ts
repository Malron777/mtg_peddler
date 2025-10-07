import { getCurrentUser } from "@/app/auth-actions";
import { dependencies } from "@/src/config/dependencies";
import { InsertCollectionItem } from "@/src/domain/tcg/collection-item.model";
import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result =
      await dependencies.useCases.collectionItems.getAllCollectionItems();

    return NextResponse.json({
      success: true,
      collectionItems: result,
    });
  } catch (error) {
    console.error("Error fetching collection items:", error);
    return NextResponse.json(
      { error: "Failed to fetch collection items" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const insertCollectionItem: InsertCollectionItem = {
      id: randomUUID(),
      collectionId: body.collectionId,
      cardScryfallId: body.cardScryfallId,
      quantity: body.quantity || 1,
      condition: body.condition || "NM",
      language: body.language || "en",
      isFoil: body.isFoil || false,
      listingType: body.listingType || "both",
      customPrice: body.customPrice,
      priceSource: body.priceSource || "tcg",
    };

    const result =
      await dependencies.useCases.collectionItems.createCollectionItem(
        insertCollectionItem
      );

    if (!result.success || !result.collectionItem) {
      return NextResponse.json(
        { error: result.error || "Failed to create collection item" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      collectionItem: result.collectionItem,
    });
  } catch (error) {
    console.error("Error creating collection item:", error);
    return NextResponse.json(
      { error: "Failed to create collection item" },
      { status: 500 }
    );
  }
}

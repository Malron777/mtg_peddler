import { getCurrentUser } from "@/app/auth-actions";
import { dependencies } from "@/src/config/dependencies";
import { UpdateCollectionItem } from "@/src/domain/tcg/collection-item.model";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result =
      await dependencies.useCases.collectionItems.getCollectionItemById(
        params.id
      );

    if (!result.success || !result.collectionItem) {
      return NextResponse.json(
        { error: result.error || "Collection item not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      collectionItem: result.collectionItem,
    });
  } catch (error) {
    console.error("Error fetching collection item:", error);
    return NextResponse.json(
      { error: "Failed to fetch collection item" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const updateData: UpdateCollectionItem = {
      id: params.id,
      collectionId: body.collectionId,
      cardScryfallId: body.cardScryfallId,
      quantity: body.quantity,
      condition: body.condition,
      language: body.language,
      isFoil: body.isFoil,
      listingType: body.listingType,
      customPrice: body.customPrice,
      priceSource: body.priceSource,
    };

    const collectionItem =
      await dependencies.useCases.collectionItems.updateCollectionItem(
        updateData
      );

    return NextResponse.json({
      success: true,
      collectionItem,
    });
  } catch (error) {
    console.error("Error updating collection item:", error);
    return NextResponse.json(
      { error: "Failed to update collection item" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dependencies.useCases.collectionItems.deleteCollectionItem(params.id);

    return NextResponse.json({
      success: true,
      message: "Collection item deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting collection item:", error);
    return NextResponse.json(
      { error: "Failed to delete collection item" },
      { status: 500 }
    );
  }
}

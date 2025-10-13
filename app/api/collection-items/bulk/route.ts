import { getCurrentUser } from "@/app/auth-actions";
import { dependencies } from "@/src/config/dependencies";
import { InsertCollectionItem } from "@/src/domain/tcg/collection-item.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { items }: { items: InsertCollectionItem[] } = body;

    if (!items || !Array.isArray(items)) {
      return NextResponse.json(
        { error: "Items array is required" },
        { status: 400 }
      );
    }

    if (items.length === 0) {
      return NextResponse.json({
        success: true,
        collectionItems: [],
      });
    }

    const result =
      await dependencies.useCases.collectionItems.createBulkCollectionItems(
        items
      );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to create bulk collection items" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      collectionItems: result.collectionItems,
    });
  } catch (error) {
    console.error("Error creating bulk collection items:", error);
    return NextResponse.json(
      { error: "Failed to create bulk collection items" },
      { status: 500 }
    );
  }
}

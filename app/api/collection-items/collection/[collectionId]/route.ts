import { getCurrentUser } from "@/app/auth-actions";
import { dependencies } from "@/src/config/dependencies";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ collectionId: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    const result =
      await dependencies.useCases.collectionItems.getAllCollectionItemsForCollection(
        resolvedParams.collectionId
      );

    return NextResponse.json({
      success: true,
      collectionItems: result.collectionItems,
    });
  } catch (error) {
    console.error("Error fetching collection items for collection:", error);
    return NextResponse.json(
      { error: "Failed to fetch collection items for collection" },
      { status: 500 }
    );
  }
}

import { getCurrentUser } from "@/app/auth-actions";
import { dependencies } from "@/src/config/dependencies";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    console.log("=== CHANGE VERSION API CALLED ===");

    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    console.log("Request body:", body);

    const result =
      await dependencies.useCases.changeCardVersion.changeCardVersion({
        collectionItemId: body.collectionItemId,
        newCardScryfallId: body.newCardScryfallId,
        newCardData: {
          scryfallId: body.newCardData.scryfallId,
          oracleId: body.newCardData.oracleId,
          name: body.newCardData.name,
          setCode: body.newCardData.setCode,
          setName: body.newCardData.setName,
          imageUris: body.newCardData.imageUris,
          cachedData: body.newCardData.cachedData,
        },
      });

    console.log("Change version result:", result);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to change card version" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      oldCollectionItem: result.oldCollectionItem,
      newCollectionItem: result.newCollectionItem,
    });
  } catch (error) {
    console.error("Error changing card version:", error);
    return NextResponse.json(
      { error: "Failed to change card version" },
      { status: 500 }
    );
  }
}

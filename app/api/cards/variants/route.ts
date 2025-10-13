import { getCurrentUser } from "@/app/auth-actions";
import { ScryfallService } from "@/src/app/services/scryfall.service";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const cardName = searchParams.get("name");

    if (!cardName) {
      return NextResponse.json(
        { error: "Card name is required" },
        { status: 400 }
      );
    }

    const scryfallService = new ScryfallService();

    try {
      // Get all variants of the card
      const variants = await scryfallService.getCardWithAllVariants(cardName);

      return NextResponse.json({
        success: true,
        cardName,
        variants,
        count: variants.length,
      });
    } catch (error) {
      console.error("Error fetching card variants:", error);
      return NextResponse.json(
        { error: "Failed to fetch card variants" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error in card variants endpoint:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}



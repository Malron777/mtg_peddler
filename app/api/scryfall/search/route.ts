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
    const query = searchParams.get("q");
    const exact = searchParams.get("exact") === "true";

    if (!query) {
      return NextResponse.json(
        { error: "Query parameter 'q' is required" },
        { status: 400 }
      );
    }

    const scryfallService = new ScryfallService();

    if (exact) {
      const card = await scryfallService.getCardByExactName(query);
      return NextResponse.json({
        success: true,
        cards: [card],
        totalCards: 1,
        hasMore: false,
      });
    } else {
      // For fuzzy search, we'll use the search endpoint
      const result = await scryfallService.makeRequest<any>(
        `/cards/search?q=${encodeURIComponent(query)}&order=name`
      );

      return NextResponse.json({
        success: true,
        cards: result.data,
        totalCards: result.total_cards,
        hasMore: result.has_more,
      });
    }
  } catch (error) {
    console.error("Error searching cards:", error);
    return NextResponse.json(
      { error: "Failed to search cards" },
      { status: 500 }
    );
  }
}

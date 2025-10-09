import { getCurrentUser } from "@/app/auth-actions";
import { dependencies } from "@/src/config/dependencies";
import { InsertCard } from "@/src/domain/tcg/card.model";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "50");

    const result = await dependencies.useCases.cards.getAllCards({
      page,
      pageSize,
    });

    return NextResponse.json({
      success: true,
      cards: result.cards,
      totalCount: result.totalCount,
      page: result.page,
      pageSize: result.pageSize,
      totalPages: result.totalPages,
    });
  } catch (error) {
    console.error("Error fetching cards:", error);
    return NextResponse.json(
      { error: "Failed to fetch cards" },
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
    const insertCard: InsertCard = {
      scryfallId: body.scryfallId,
      oracleId: body.oracleId,
      name: body.name,
      setCode: body.setCode,
      setName: body.setName,
      imageUris: body.imageUris,
      pricesLastUpdated: body.pricesLastUpdated,
      cachedData: body.cachedData,
    };

    const result = await dependencies.useCases.cards.createCard(insertCard);

    if (!result.success || !result.card) {
      return NextResponse.json(
        { error: result.error || "Failed to create card" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      card: result.card,
    });
  } catch (error) {
    console.error("Error creating card:", error);
    return NextResponse.json(
      { error: "Failed to create card" },
      { status: 500 }
    );
  }
}

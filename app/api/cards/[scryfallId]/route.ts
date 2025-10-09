import { getCurrentUser } from "@/app/auth-actions";
import { dependencies } from "@/src/config/dependencies";
import { UpdateCard } from "@/src/domain/tcg/card.model";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { scryfallId: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const includeCollectionItems =
      searchParams.get("includeCollectionItems") === "true";

    const result = await dependencies.useCases.cards.getCard(
      params.scryfallId,
      {
        includeCollectionItems,
      }
    );

    if (!result.success || !result.card) {
      return NextResponse.json({ error: "Card not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      card: result.card,
    });
  } catch (error) {
    console.error("Error fetching card:", error);
    return NextResponse.json(
      { error: "Failed to fetch card" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { scryfallId: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const updateData: UpdateCard = {
      scryfallId: params.scryfallId,
      oracleId: body.oracleId,
      name: body.name,
      setCode: body.setCode,
      setName: body.setName,
      imageUris: body.imageUris,
      pricesLastUpdated: body.pricesLastUpdated,
      cachedData: body.cachedData,
    };

    const card = await dependencies.useCases.cards.updateCard(updateData);

    return NextResponse.json({
      success: true,
      card,
    });
  } catch (error) {
    console.error("Error updating card:", error);
    return NextResponse.json(
      { error: "Failed to update card" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { scryfallId: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dependencies.useCases.cards.deleteCard(params.scryfallId);

    return NextResponse.json({
      success: true,
      message: "Card deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting card:", error);
    return NextResponse.json(
      { error: "Failed to delete card" },
      { status: 500 }
    );
  }
}

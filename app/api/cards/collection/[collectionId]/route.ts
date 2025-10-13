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
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "50");

    const result = await dependencies.useCases.cards.getAllCardsForCollection(
      resolvedParams.collectionId,
      {
        page,
        pageSize,
      }
    );

    return NextResponse.json({
      success: true,
      cards: result.cards,
      totalCount: result.totalCount,
      page: result.page,
      pageSize: result.pageSize,
      totalPages: result.totalPages,
    });
  } catch (error) {
    console.error("Error fetching cards for collection:", error);
    return NextResponse.json(
      { error: "Failed to fetch cards for collection" },
      { status: 500 }
    );
  }
}

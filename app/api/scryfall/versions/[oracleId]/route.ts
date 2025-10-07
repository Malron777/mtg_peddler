import { getCurrentUser } from "@/app/auth-actions";
import { ScryfallService } from "@/src/app/services/scryfall.service";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { oracleId: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const scryfallService = new ScryfallService();
    const versions = await scryfallService.getCardVersions(params.oracleId);

    return NextResponse.json({
      success: true,
      versions,
    });
  } catch (error) {
    console.error("Error fetching card versions:", error);
    return NextResponse.json(
      { error: "Failed to fetch card versions" },
      { status: 500 }
    );
  }
}

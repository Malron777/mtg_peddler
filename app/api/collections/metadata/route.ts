import { getCurrentUser } from "@/app/auth-actions";
import { dependencies } from "@/src/config/dependencies";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const includeFoil = searchParams.get("includeFoil");
    const priceSource = searchParams.get("priceSource") as
      | "tcg"
      | "scg"
      | "custom"
      | "mtggoldfish"
      | "cardmarket"
      | null;

    const options = {
      includeFoil: includeFoil ? includeFoil === "true" : undefined,
      priceSource: priceSource || undefined,
    };

    console.log(
      "Fetching collection information for user:",
      user.id,
      "with options:",
      options
    );

    const result =
      await dependencies.useCases.collections.getCollectionInformation(
        user.id,
        options
      );

    console.log("Collection information result:", result);

    if (!result.success) {
      console.error("Collection information failed:", result.error);
      return NextResponse.json(
        { error: result.error || "Failed to get collection information" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data,
    });
  } catch (error) {
    console.error("Error fetching collection information:", error);
    return NextResponse.json(
      {
        error: `Failed to fetch collection information: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      },
      { status: 500 }
    );
  }
}

import { dependencies } from "@/src/config/dependencies";
import { getStoreQuery } from "@/src/infra/repos/store/get-store.query";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const result = await getStoreQuery(dependencies.db, resolvedParams.id);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Store not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching store:", error);
    return NextResponse.json(
      { error: "Failed to fetch store" },
      { status: 500 }
    );
  }
}

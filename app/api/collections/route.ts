import { getCurrentUser } from "@/app/auth-actions";
import { dependencies } from "@/src/config/dependencies";
import { InsertCollection } from "@/src/domain/tcg/collection.model";
import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId") || user.id;

    const result =
      await dependencies.useCases.collections.getAllCollectionsForUser(userId);

    return NextResponse.json({
      success: true,
      collections: result.collections,
    });
  } catch (error) {
    console.error("Error fetching collections:", error);
    return NextResponse.json(
      { error: "Failed to fetch collections" },
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
    const insertCollection: InsertCollection = {
      id: randomUUID(),
      userId: user.id,
      name: body.name,
      description: body.description,
      isPublic: body.isPublic || false,
    };

    const result = await dependencies.useCases.collections.createCollection(
      insertCollection
    );

    if (!result.success || !result.collection) {
      return NextResponse.json(
        { error: result.error || "Failed to create collection" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      collection: result.collection,
    });
  } catch (error) {
    console.error("Error creating collection:", error);
    return NextResponse.json(
      { error: "Failed to create collection" },
      { status: 500 }
    );
  }
}

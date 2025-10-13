import { getCurrentUser } from "@/app/auth-actions";
import { dependencies } from "@/src/config/dependencies";
import { UpdateCollection } from "@/src/domain/tcg/collection.model";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    const result = await dependencies.useCases.collections.getCollection(
      resolvedParams.id
    );

    if (!result.success || !result.collection) {
      return NextResponse.json(
        { error: result.error || "Collection not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      collection: result.collection,
    });
  } catch (error) {
    console.error("Error fetching collection:", error);
    return NextResponse.json(
      { error: "Failed to fetch collection" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    const body = await request.json();
    const updateData: UpdateCollection = {
      id: resolvedParams.id,
      name: body.name,
      description: body.description,
      isPublic: body.isPublic,
    };

    const collection = await dependencies.useCases.collections.updateCollection(
      updateData
    );

    return NextResponse.json({
      success: true,
      collection,
    });
  } catch (error) {
    console.error("Error updating collection:", error);
    return NextResponse.json(
      { error: "Failed to update collection" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    await dependencies.useCases.collections.deleteCollection(resolvedParams.id);

    return NextResponse.json({
      success: true,
      message: "Collection deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting collection:", error);
    return NextResponse.json(
      { error: "Failed to delete collection" },
      { status: 500 }
    );
  }
}

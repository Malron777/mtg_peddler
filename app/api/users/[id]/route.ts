import { dependencies } from "@/src/config/dependencies";
import { UpdateUser } from "@/src/domain/auth/user.model";
import { getUserQuery } from "@/src/infra/repos/user/get-user.query";
import { updateUserQuery } from "@/src/infra/repos/user/update-user.query";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const result = await getUserQuery(dependencies.db, resolvedParams.id);

    if (result.success) {
      return NextResponse.json(result);
    } else {
      return NextResponse.json({ error: result.error }, { status: 404 });
    }
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const updateData: UpdateUser = await request.json();

    // Ensure the ID from the URL is used
    updateData.id = resolvedParams.id;

    const result = await updateUserQuery(dependencies.db, updateData);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}

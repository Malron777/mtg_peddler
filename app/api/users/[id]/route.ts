import { dependencies } from "@/src/config/dependencies";
import { UpdateUser } from "@/src/domain/auth/user.model";
import { getUserQuery } from "@/src/infra/repos/get-user.query";
import { updateUserQuery } from "@/src/infra/repos/update-user.query";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const result = await getUserQuery(dependencies.db, params.id);

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
  { params }: { params: { id: string } }
) {
  try {
    const updateData: UpdateUser = await request.json();

    // Ensure the ID from the URL is used
    updateData.id = params.id;

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

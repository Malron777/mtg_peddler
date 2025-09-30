import { dependencies } from "@/src/config/dependencies";
import {
  GetAllUsersOptions,
  getAllUsersQuery,
} from "@/src/infra/repos/get-all-users.query";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "50");

    const options: GetAllUsersOptions = {
      page,
      pageSize,
    };

    const result = await getAllUsersQuery(dependencies.db, options);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

import { getCurrentUser } from "@/app/auth-actions";
import { dependencies } from "@/src/config/dependencies";
import { InsertStore } from "@/src/domain/auth/stores.model";
import {
  GetAllStoresOptions,
  getAllStoresQuery,
} from "@/src/infra/repos/store/get-all-stores.query";
import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "50");

    const options: GetAllStoresOptions = {
      page,
      pageSize,
    };

    const result = await getAllStoresQuery(dependencies.db, options);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching stores:", error);
    return NextResponse.json(
      { error: "Failed to fetch stores" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get current user
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const insertData: InsertStore = {
      id: randomUUID(),
      createdBy: currentUser.id,
      ...body,
    };

    const result = await dependencies.useCases.stores.createStore(insertData);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to create store" },
        { status: 400 }
      );
    }

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Error creating store:", error);
    return NextResponse.json(
      { error: "Failed to create store" },
      { status: 500 }
    );
  }
}

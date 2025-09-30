import { DB } from "@/src/infra/db/db";
import { storeStaff } from "@/src/infra/db/schema";
import { and, eq } from "drizzle-orm";

export interface DeleteStoreStaffResult {
  success: boolean;
  error?: string;
}

export async function deleteStoreStaffQuery(
  db: DB,
  storeId: string,
  userId: string
): Promise<DeleteStoreStaffResult> {
  try {
    await db
      .delete(storeStaff)
      .where(
        and(eq(storeStaff.storeId, storeId), eq(storeStaff.userId, userId))
      );

    return {
      success: true,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

import {
  InsertStoreStaff,
  StoreStaff,
} from "@/src/domain/auth/store-staff.model";
import { DB } from "@/src/infra/db/db";
import { storeStaff } from "@/src/infra/db/schema";

export interface CreateStoreStaffResult {
  success: boolean;
  storeStaff?: StoreStaff;
  error?: string;
}

export async function createStoreStaffQuery(
  db: DB,
  insertStoreStaff: InsertStoreStaff
): Promise<CreateStoreStaffResult> {
  try {
    const result = await db
      .insert(storeStaff)
      .values(insertStoreStaff)
      .returning();

    return {
      success: true,
      storeStaff: result[0],
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

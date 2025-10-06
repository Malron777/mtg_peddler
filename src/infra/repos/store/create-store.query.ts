import { InsertStore } from "@/src/domain/auth/stores.model";
import { DB } from "@/src/infra/db/db";
import { stores } from "@/src/infra/db/schema/auth";

export interface CreateStoreResult {
  success: boolean;
  store?: any;
  error?: string;
}

export async function createStoreQuery(
  db: DB,
  insertStore: InsertStore
): Promise<CreateStoreResult> {
  try {
    const result = await db.insert(stores).values(insertStore).returning();

    return {
      success: true,
      store: result[0],
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

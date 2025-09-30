import { Store } from "@/src/domain/auth/stores.model";
import { DB } from "@/src/infra/db/db";
import { stores } from "@/src/infra/db/schema";
import { eq } from "drizzle-orm";

export interface GetStoreResult {
  success: boolean;
  store?: Store;
  error?: string;
}

export async function getStoreQuery(
  db: DB,
  id: string
): Promise<GetStoreResult> {
  try {
    const result = await db.query.stores.findFirst({
      where: eq(stores.id, id),
    });

    if (result) {
      return {
        success: true,
        store: result,
      };
    } else {
      return {
        success: false,
        error: "Store not found",
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

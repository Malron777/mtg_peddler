import { Store, UpdateStore } from "@/src/domain/auth/stores.model";
import { DB } from "@/src/infra/db/db";
import { stores } from "@/src/infra/db/schema";
import { eq } from "drizzle-orm";

export async function updateStoreQuery(
  db: DB,
  updateStore: UpdateStore
): Promise<Store> {
  const result = await db
    .update(stores)
    .set({
      ...updateStore,
      updatedAt: new Date(),
    })
    .where(eq(stores.id, updateStore.id))
    .returning();

  return result[0];
}

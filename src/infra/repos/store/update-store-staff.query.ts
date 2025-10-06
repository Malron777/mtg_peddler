import {
  StoreStaff,
  UpdateStoreStaff,
} from "@/src/domain/auth/store-staff.model";
import { DB } from "@/src/infra/db/db";
import { storeStaff } from "@/src/infra/db/schema";
import { and, eq } from "drizzle-orm";
import { filterUndefined } from "../utils";

export async function updateStoreStaffQuery(
  db: DB,
  updateStoreStaff: UpdateStoreStaff
): Promise<StoreStaff> {
  const result = await db
    .update(storeStaff)
    .set({
      ...filterUndefined(updateStoreStaff),
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(storeStaff.storeId, updateStoreStaff.storeId),
        eq(storeStaff.userId, updateStoreStaff.userId)
      )
    )
    .returning();

  return result[0];
}

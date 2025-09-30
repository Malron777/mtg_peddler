import { UpdateWantList, WantList } from "@/src/domain/tcg/want-list.model";
import { DB } from "@/src/infra/db/db";
import { wantLists } from "@/src/infra/db/schema";
import { eq } from "drizzle-orm";

export async function updateWantListQuery(
  db: DB,
  updateWantList: UpdateWantList
): Promise<WantList> {
  const result = await db
    .update(wantLists)
    .set({
      ...updateWantList,
      updatedAt: new Date(),
    })
    .where(eq(wantLists.id, updateWantList.id))
    .returning();

  return result[0];
}

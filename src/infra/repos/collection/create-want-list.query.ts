import { InsertWantList, WantList } from "@/src/domain/tcg/want-list.model";
import { DB } from "@/src/infra/db/db";
import { wantLists } from "@/src/infra/db/schema";

export interface CreateWantListResult {
  success: boolean;
  wantList?: WantList;
  error?: string;
}

export async function createWantListQuery(
  db: DB,
  insertWantList: InsertWantList
): Promise<CreateWantListResult> {
  try {
    const result = await db
      .insert(wantLists)
      .values(insertWantList)
      .returning();

    return {
      success: true,
      wantList: result[0],
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

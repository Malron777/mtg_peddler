import { WantList } from "@/src/domain/tcg/want-list.model";
import { DB } from "@/src/infra/db/db";
import { wantLists } from "@/src/infra/db/schema";
import { eq } from "drizzle-orm";

export interface GetWantListResult {
  success: boolean;
  wantList?: WantList;
  error?: string;
}

export async function getWantListQuery(
  db: DB,
  id: string
): Promise<GetWantListResult> {
  try {
    const result = await db.query.wantLists.findFirst({
      where: eq(wantLists.id, id),
    });

    if (result) {
      return {
        success: true,
        wantList: result,
      };
    } else {
      return {
        success: false,
        error: "Want list not found",
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

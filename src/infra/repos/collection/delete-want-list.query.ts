import { DB } from "@/src/infra/db/db";
import { wantLists } from "@/src/infra/db/schema";
import { eq } from "drizzle-orm";

export interface DeleteWantListResult {
  success: boolean;
  error?: string;
}

export async function deleteWantListQuery(
  db: DB,
  id: string
): Promise<DeleteWantListResult> {
  try {
    await db.delete(wantLists).where(eq(wantLists.id, id));

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

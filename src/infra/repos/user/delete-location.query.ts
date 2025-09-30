import { DB } from "@/src/infra/db/db";
import { locations } from "@/src/infra/db/schema";
import { eq } from "drizzle-orm";

export interface DeleteLocationResult {
  success: boolean;
  error?: string;
}

export async function deleteLocationQuery(
  db: DB,
  id: string
): Promise<DeleteLocationResult> {
  try {
    await db.delete(locations).where(eq(locations.id, id));

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

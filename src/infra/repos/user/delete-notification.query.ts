import { DB } from "@/src/infra/db/db";
import { notifications } from "@/src/infra/db/schema";
import { eq } from "drizzle-orm";

export interface DeleteNotificationResult {
  success: boolean;
  error?: string;
}

export async function deleteNotificationQuery(
  db: DB,
  id: string
): Promise<DeleteNotificationResult> {
  try {
    await db.delete(notifications).where(eq(notifications.id, id));

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

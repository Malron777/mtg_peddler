import { Notification } from "@/src/domain/tcg/notification.model";
import { DB } from "@/src/infra/db/db";
import { notifications } from "@/src/infra/db/schema";
import { eq } from "drizzle-orm";

export interface MarkNotificationAsReadResult {
  success: boolean;
  notification?: Notification;
  error?: string;
}

export async function markNotificationAsReadQuery(
  db: DB,
  id: string
): Promise<MarkNotificationAsReadResult> {
  try {
    const result = await db
      .update(notifications)
      .set({
        isRead: true,
        updatedAt: new Date(),
      })
      .where(eq(notifications.id, id))
      .returning();

    if (result[0]) {
      return {
        success: true,
        notification: result[0],
      };
    } else {
      return {
        success: false,
        error: "Notification not found",
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

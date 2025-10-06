import {
  InsertNotification,
  Notification,
} from "@/src/domain/tcg/notification.model";
import { DB } from "@/src/infra/db/db";
import { notifications } from "@/src/infra/db/schema";

export interface CreateNotificationResult {
  success: boolean;
  notification?: Notification;
  error?: string;
}

export async function createNotificationQuery(
  db: DB,
  insertNotification: InsertNotification
): Promise<CreateNotificationResult> {
  try {
    const result = await db
      .insert(notifications)
      .values(insertNotification)
      .returning();

    return {
      success: true,
      notification: result[0],
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

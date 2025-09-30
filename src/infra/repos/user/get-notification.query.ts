import { Notification } from "@/src/domain/tcg/notification.model";
import { DB } from "@/src/infra/db/db";
import { notifications } from "@/src/infra/db/schema";
import { eq } from "drizzle-orm";

export interface GetNotificationResult {
  success: boolean;
  notification?: Notification;
  error?: string;
}

export async function getNotificationQuery(
  db: DB,
  id: string
): Promise<GetNotificationResult> {
  try {
    const result = await db.query.notifications.findFirst({
      where: eq(notifications.id, id),
    });

    if (result) {
      return {
        success: true,
        notification: result,
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

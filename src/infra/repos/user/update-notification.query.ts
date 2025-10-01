import {
  Notification,
  UpdateNotification,
} from "@/src/domain/tcg/notification.model";
import { DB } from "@/src/infra/db/db";
import { notifications } from "@/src/infra/db/schema";
import { eq } from "drizzle-orm";
import { filterUndefined } from "../utils";

export async function updateNotificationQuery(
  db: DB,
  updateNotification: UpdateNotification
): Promise<Notification> {
  const result = await db
    .update(notifications)
    .set({
      ...filterUndefined(updateNotification),
      updatedAt: new Date(),
    })
    .where(eq(notifications.id, updateNotification.id))
    .returning();

  return result[0];
}

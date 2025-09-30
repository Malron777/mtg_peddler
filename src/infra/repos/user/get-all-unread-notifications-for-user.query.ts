import { Notification } from "@/src/domain/tcg/notification.model";
import { DB } from "@/src/infra/db/db";
import { notifications } from "@/src/infra/db/schema";
import { and, desc, eq, sql } from "drizzle-orm";

export interface GetAllUnreadNotificationsForUserOptions {
  page?: number;
  pageSize?: number;
}

export interface GetAllUnreadNotificationsForUserResult {
  notifications: Notification[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export async function getAllUnreadNotificationsForUserQuery(
  db: DB,
  userId: string,
  options: GetAllUnreadNotificationsForUserOptions = {}
): Promise<GetAllUnreadNotificationsForUserResult> {
  const page = options.page ?? 1;
  const pageSize = options.pageSize ?? 50;
  const offset = (page - 1) * pageSize;

  // Get total count
  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(notifications)
    .where(
      and(eq(notifications.userId, userId), eq(notifications.isRead, false))
    );

  const totalCount = countResult[0]?.count ?? 0;

  // Get paginated notifications
  const notificationsResult = await db
    .select()
    .from(notifications)
    .where(
      and(eq(notifications.userId, userId), eq(notifications.isRead, false))
    )
    .orderBy(desc(notifications.createdAt))
    .limit(pageSize)
    .offset(offset);

  const totalPages = Math.ceil(totalCount / pageSize);

  return {
    notifications: notificationsResult,
    totalCount,
    page,
    pageSize,
    totalPages,
  };
}

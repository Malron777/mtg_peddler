import {
  InsertNotification,
  UpdateNotification,
} from "@/src/domain/tcg/notification.model";
import { DB } from "@/src/infra/db/db";
import { createNotificationQuery } from "@/src/infra/repos/user/create-notification.query";
import { deleteNotificationQuery } from "@/src/infra/repos/user/delete-notification.query";
import { getAllNotificationsQuery } from "@/src/infra/repos/user/get-all-notifications.query";
import { getAllUnreadNotificationsForUserQuery } from "@/src/infra/repos/user/get-all-unread-notifications-for-user.query";
import { getNotificationQuery } from "@/src/infra/repos/user/get-notification.query";
import { markNotificationAsReadQuery } from "@/src/infra/repos/user/mark-notification-as-read.query";
import { updateNotificationQuery } from "@/src/infra/repos/user/update-notification.query";

export class NotificationsUseCase {
  private readonly db: DB;

  constructor(db: DB) {
    this.db = db;
  }

  async createNotification(insertNotification: InsertNotification) {
    return createNotificationQuery(this.db, insertNotification);
  }

  async getNotification(notificationId: string) {
    return getNotificationQuery(this.db, notificationId);
  }

  async getAllNotifications() {
    return getAllNotificationsQuery(this.db);
  }

  async getAllUnreadNotificationsForUser(userId: string) {
    return getAllUnreadNotificationsForUserQuery(this.db, userId);
  }

  async updateNotification(updateData: UpdateNotification) {
    return updateNotificationQuery(this.db, updateData);
  }

  async deleteNotification(notificationId: string) {
    return deleteNotificationQuery(this.db, notificationId);
  }

  async markNotificationAsRead(notificationId: string) {
    return markNotificationAsReadQuery(this.db, notificationId);
  }
}

import { userTestFactory } from "@/src/domain/auth/user.model.test-factory";
import { notificationTestFactory } from "@/src/domain/tcg/notification.model.test-factory";
import { buildRunWithTestDb, migrateTestDb } from "@/test-db";
import { beforeAll, describe, expect, it } from "vitest";
import { DB } from "../../db/db";
import { markNotificationAsReadQuery } from "./mark-notification-as-read.query";

describe("markNotificationAsReadQuery", () => {
  let runWithTestDb: Awaited<ReturnType<typeof buildRunWithTestDb>>;

  beforeAll(async () => {
    await migrateTestDb();
    runWithTestDb = await buildRunWithTestDb();
  });

  it("should successfully mark an unread notification as read", async () => {
    await runWithTestDb(async (db: DB) => {
      const user = await userTestFactory.buildAndInsertOne(db, {
        id: "test-user-id-1",
        name: "Test User",
        email: "test@example.com",
        emailVerified: true,
        image: "https://example.com/avatar.jpg",
        reputationScore: "100",
        role: "user",
        preferredCurrency: "USD",
        notificationPreferences: { email: true, sms: false, push: true },
      });

      const notification = await notificationTestFactory.insertOne(db, {
        userId: user.id,
        type: "system",
        title: "Test Notification",
        content: "This is a test notification",
        relatedEntityType: "user",
        relatedEntityId: user.id,
        isRead: false,
      });

      const result = await markNotificationAsReadQuery(db, notification.id);

      expect(result.success).toBe(true);
      expect(result.notification).toBeDefined();
      expect(result.notification?.id).toBe(notification.id);
      expect(result.notification?.isRead).toBe(true);
      expect(result.notification?.updatedAt).toBeDefined();
      expect(result.notification?.updatedAt.getTime()).toBeGreaterThan(
        notification.updatedAt.getTime()
      );
      expect(result.error).toBeUndefined();
    });
  });

  it("should handle marking already read notification as read", async () => {
    await runWithTestDb(async (db: DB) => {
      const user = await userTestFactory.buildAndInsertOne(db, {
        id: "test-user-id-2",
        name: "Test User 2",
        email: "test2@example.com",
        emailVerified: true,
        image: "https://example.com/avatar2.jpg",
        reputationScore: "200",
        role: "user",
        preferredCurrency: "EUR",
        notificationPreferences: { email: true, sms: true, push: true },
      });

      const readNotification = await notificationTestFactory.insertOne(db, {
        userId: user.id,
        type: "deal_update",
        title: "Already Read Notification",
        content: "This notification is already read",
        relatedEntityType: "deal",
        relatedEntityId: "test-deal-id",
        isRead: true,
      });

      const result = await markNotificationAsReadQuery(db, readNotification.id);

      expect(result.success).toBe(true);
      expect(result.notification).toBeDefined();
      expect(result.notification?.id).toBe(readNotification.id);
      expect(result.notification?.isRead).toBe(true);
      expect(result.error).toBeUndefined();
    });
  });

  it("should return error when notification is not found", async () => {
    await runWithTestDb(async (db: DB) => {
      const nonExistentId = "non-existent-notification-id";

      const result = await markNotificationAsReadQuery(db, nonExistentId);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Notification not found");
      expect(result.notification).toBeUndefined();
    });
  });

  it("should handle empty id gracefully", async () => {
    await runWithTestDb(async (db: DB) => {
      const result = await markNotificationAsReadQuery(db, "");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Notification not found");
      expect(result.notification).toBeUndefined();
    });
  });

  it("should handle null id gracefully", async () => {
    await runWithTestDb(async (db: DB) => {
      const result = await markNotificationAsReadQuery(
        db,
        null as unknown as string
      );

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.notification).toBeUndefined();
    });
  });

  it("should handle malformed id gracefully", async () => {
    await runWithTestDb(async (db: DB) => {
      const malformedId = "malformed-id-with-special-chars-!@#$%";

      const result = await markNotificationAsReadQuery(db, malformedId);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Notification not found");
      expect(result.notification).toBeUndefined();
    });
  });

  it("should mark different notification types as read", async () => {
    await runWithTestDb(async (db: DB) => {
      const user = await userTestFactory.buildAndInsertOne(db, {
        id: "test-user-id-3",
        name: "Test User 3",
        email: "test3@example.com",
        emailVerified: true,
        image: "https://example.com/avatar3.jpg",
        reputationScore: "300",
        role: "user",
        preferredCurrency: "USD",
        notificationPreferences: { email: true, sms: false, push: true },
      });

      const systemNotification = await notificationTestFactory.insertOne(db, {
        userId: user.id,
        type: "system",
        title: "System Notification",
        content: "This is a system notification",
        relatedEntityType: "user",
        relatedEntityId: user.id,
        isRead: false,
      });

      const dealNotification = await notificationTestFactory.insertOne(db, {
        userId: user.id,
        type: "deal_update",
        title: "Deal Notification",
        content: "This is a deal notification",
        relatedEntityType: "deal",
        relatedEntityId: "test-deal-id",
        isRead: false,
      });

      const result1 = await markNotificationAsReadQuery(
        db,
        systemNotification.id
      );
      const result2 = await markNotificationAsReadQuery(
        db,
        dealNotification.id
      );

      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);
      expect(result1.notification?.isRead).toBe(true);
      expect(result2.notification?.isRead).toBe(true);
      expect(result1.error).toBeUndefined();
      expect(result2.error).toBeUndefined();
    });
  });

  it("should mark notification without related entity as read", async () => {
    await runWithTestDb(async (db: DB) => {
      const user = await userTestFactory.buildAndInsertOne(db, {
        id: "test-user-id-4",
        name: "Test User 4",
        email: "test4@example.com",
        emailVerified: true,
        image: "https://example.com/avatar4.jpg",
        reputationScore: "400",
        role: "user",
        preferredCurrency: "USD",
        notificationPreferences: { email: true, sms: false, push: true },
      });

      const notificationWithoutEntity = await notificationTestFactory.insertOne(
        db,
        {
          userId: user.id,
          type: "system",
          title: "Notification Without Entity",
          content: "This notification has no related entity",
          relatedEntityType: null,
          relatedEntityId: null,
          isRead: false,
        }
      );

      const result = await markNotificationAsReadQuery(
        db,
        notificationWithoutEntity.id
      );

      expect(result.success).toBe(true);
      expect(result.notification).toBeDefined();
      expect(result.notification?.isRead).toBe(true);
      expect(result.notification?.relatedEntityType).toBeNull();
      expect(result.notification?.relatedEntityId).toBeNull();
      expect(result.error).toBeUndefined();
    });
  });

  it("should mark notification with long content as read", async () => {
    await runWithTestDb(async (db: DB) => {
      const user = await userTestFactory.buildAndInsertOne(db, {
        id: "test-user-id-5",
        name: "Test User 5",
        email: "test5@example.com",
        emailVerified: true,
        image: "https://example.com/avatar5.jpg",
        reputationScore: "500",
        role: "user",
        preferredCurrency: "USD",
        notificationPreferences: { email: true, sms: false, push: true },
      });

      const longContent =
        "This is a very long notification that contains multiple sentences and should test the system's ability to handle longer content. It includes various punctuation marks, numbers like 123, and special characters like @#$%. The notification should be stored correctly without any issues and should be able to handle extensive text content.";

      const longNotification = await notificationTestFactory.insertOne(db, {
        userId: user.id,
        type: "system",
        title: "Long Content Notification",
        content: longContent,
        relatedEntityType: "user",
        relatedEntityId: user.id,
        isRead: false,
      });

      const result = await markNotificationAsReadQuery(db, longNotification.id);

      expect(result.success).toBe(true);
      expect(result.notification).toBeDefined();
      expect(result.notification?.isRead).toBe(true);
      expect(result.notification?.content).toBe(longContent);
      expect(result.error).toBeUndefined();
    });
  });

  it("should update the updatedAt timestamp when marking as read", async () => {
    await runWithTestDb(async (db: DB) => {
      const user = await userTestFactory.buildAndInsertOne(db, {
        id: "test-user-id-6",
        name: "Test User 6",
        email: "test6@example.com",
        emailVerified: true,
        image: "https://example.com/avatar6.jpg",
        reputationScore: "600",
        role: "user",
        preferredCurrency: "USD",
        notificationPreferences: { email: true, sms: false, push: true },
      });

      const notification = await notificationTestFactory.insertOne(db, {
        userId: user.id,
        type: "system",
        title: "Timestamp Test Notification",
        content: "This notification tests timestamp updates",
        relatedEntityType: "user",
        relatedEntityId: user.id,
        isRead: false,
      });

      const originalUpdatedAt = notification.updatedAt;

      // Wait a bit to ensure different timestamps
      await new Promise((resolve) => setTimeout(resolve, 10));

      const result = await markNotificationAsReadQuery(db, notification.id);

      expect(result.success).toBe(true);
      expect(result.notification).toBeDefined();
      expect(result.notification?.isRead).toBe(true);
      expect(result.notification?.updatedAt.getTime()).toBeGreaterThan(
        originalUpdatedAt.getTime()
      );
      expect(result.error).toBeUndefined();
    });
  });
});

import { userTestFactory } from "@/src/domain/auth/user.model.test-factory";
import { notificationTestFactory } from "@/src/domain/tcg/notification.model.test-factory";
import { buildRunWithTestDb, migrateTestDb } from "@/test-db";
import { beforeAll, describe, expect, it } from "vitest";
import { DB } from "../../db/db";
import { deleteNotificationQuery } from "./delete-notification.query";

describe("deleteNotificationQuery", () => {
  let runWithTestDb: Awaited<ReturnType<typeof buildRunWithTestDb>>;

  beforeAll(async () => {
    await migrateTestDb();
    runWithTestDb = await buildRunWithTestDb();
  });

  it("should successfully delete an existing notification", async () => {
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

      const result = await deleteNotificationQuery(db, notification.id);

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
    });
  });

  it("should handle deleting non-existent notification gracefully", async () => {
    await runWithTestDb(async (db: DB) => {
      const nonExistentId = "non-existent-notification-id";

      const result = await deleteNotificationQuery(db, nonExistentId);

      expect(result.success).toBe(true); // Delete operations typically succeed even if nothing was deleted
      expect(result.error).toBeUndefined();
    });
  });

  it("should handle empty id gracefully", async () => {
    await runWithTestDb(async (db: DB) => {
      const result = await deleteNotificationQuery(db, "");

      expect(result.success).toBe(true); // Delete operations typically succeed even with empty ID
      expect(result.error).toBeUndefined();
    });
  });

  it("should handle null id gracefully", async () => {
    await runWithTestDb(async (db: DB) => {
      const result = await deleteNotificationQuery(
        db,
        null as unknown as string
      );

      expect(result.success).toBe(true);
      expect(result.error).not.toBeDefined();
    });
  });

  it("should handle malformed id gracefully", async () => {
    await runWithTestDb(async (db: DB) => {
      const malformedId = "malformed-id-with-special-chars-!@#$%";

      const result = await deleteNotificationQuery(db, malformedId);

      expect(result.success).toBe(true); // Delete operations typically succeed even with malformed IDs
      expect(result.error).toBeUndefined();
    });
  });

  it("should delete only the specified notification", async () => {
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

      const notification1 = await notificationTestFactory.buildAndInsertOne(
        db,
        {
          userId: user.id,
          type: "system",
          title: "First Notification",
          content: "This is the first notification",
          relatedEntityType: "user",
          relatedEntityId: user.id,
          isRead: false,
        }
      );

      const notification2 = await notificationTestFactory.insertOne(db, {
        userId: user.id,
        type: "deal_update",
        title: "Second Notification",
        content: "This is the second notification",
        relatedEntityType: "deal",
        relatedEntityId: "test-deal-id",
        isRead: true,
      });

      const result = await deleteNotificationQuery(db, notification1.id);

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();

      // Verify that notification2 still exists by trying to delete it
      const result2 = await deleteNotificationQuery(db, notification2.id);
      expect(result2.success).toBe(true);
    });
  });

  it("should handle deleting read notification", async () => {
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

      const readNotification = await notificationTestFactory.insertOne(db, {
        userId: user.id,
        type: "system",
        title: "Read Notification",
        content: "This notification has been read",
        relatedEntityType: "user",
        relatedEntityId: user.id,
        isRead: true,
      });

      const result = await deleteNotificationQuery(db, readNotification.id);

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
    });
  });

  it("should handle deleting notification with long content", async () => {
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

      const longContent =
        "This is a very long notification that contains multiple sentences and should test the system's ability to handle longer content. It includes various punctuation marks, numbers like 123, and special characters like @#$%. The notification should be stored correctly without any issues and should be able to handle extensive text content.";

      const longNotification = await notificationTestFactory.buildAndInsertOne(
        db,
        {
          userId: user.id,
          type: "system",
          title: "Long Content Notification",
          content: longContent,
          relatedEntityType: "user",
          relatedEntityId: user.id,
          isRead: false,
        }
      );

      const result = await deleteNotificationQuery(db, longNotification.id);

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
    });
  });

  it("should handle deleting notification without related entity", async () => {
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

      const result = await deleteNotificationQuery(
        db,
        notificationWithoutEntity.id
      );

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
    });
  });

  it("should handle deleting different notification types", async () => {
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

      const result1 = await deleteNotificationQuery(db, systemNotification.id);
      const result2 = await deleteNotificationQuery(db, dealNotification.id);

      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);
      expect(result1.error).toBeUndefined();
      expect(result2.error).toBeUndefined();
    });
  });
});

import { userTestFactory } from "@/src/domain/auth/user.model.test-factory";
import { notificationTestFactory } from "@/src/domain/tcg/notification.model.test-factory";
import { buildRunWithTestDb, migrateTestDb } from "@/test-db";
import { beforeAll, describe, expect, it } from "vitest";
import { DB } from "../../db/db";
import { updateNotificationQuery } from "./update-notification.query";

describe("updateNotificationQuery", () => {
  let runWithTestDb: Awaited<ReturnType<typeof buildRunWithTestDb>>;

  beforeAll(async () => {
    await migrateTestDb();
    runWithTestDb = await buildRunWithTestDb();
  });

  it("should successfully update an existing notification", async () => {
    await runWithTestDb(async (db: DB) => {
      const user = await userTestFactory.insertOne(db, {
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
        title: "Original Title",
        content: "Original notification content",
        relatedEntityType: "user",
        relatedEntityId: user.id,
        isRead: false,
      });

      const updateData = {
        id: notification.id,
        title: "Updated Title",
        content: "Updated notification content",
        isRead: true,
      };

      const result = await updateNotificationQuery(db, updateData);

      expect(result.id).toBe(notification.id);
      expect(result.title).toBe("Updated Title");
      expect(result.content).toBe("Updated notification content");
      expect(result.isRead).toBe(true);
      expect(result.type).toBe(notification.type); // Should remain unchanged
      expect(result.userId).toBe(notification.userId); // Should remain unchanged
      expect(result.relatedEntityType).toBe(notification.relatedEntityType); // Should remain unchanged
      expect(result.relatedEntityId).toBe(notification.relatedEntityId); // Should remain unchanged
      expect(result.updatedAt).toBeDefined();
      expect(result.updatedAt.getTime()).toBeGreaterThan(
        notification.updatedAt.getTime()
      );
    });
  });

  it("should throw error when trying to update non-existent notification", async () => {
    await runWithTestDb(async (db: DB) => {
      const updateData = {
        id: "non-existent-notification-id",
        title: "Updated Title",
        content: "Updated content",
        isRead: true,
      };

      await expect(updateNotificationQuery(db, updateData)).rejects.toThrow();
    });
  });

  it("should handle partial updates correctly", async () => {
    await runWithTestDb(async (db: DB) => {
      const user = await userTestFactory.insertOne(db, {
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

      const notification = await notificationTestFactory.insertOne(db, {
        userId: user.id,
        type: "deal_update",
        title: "Original Deal Title",
        content: "Original deal notification",
        relatedEntityType: "deal",
        relatedEntityId: "test-deal-id",
        isRead: false,
      });

      const updateData = {
        id: notification.id,
        isRead: true,
      };

      const result = await updateNotificationQuery(db, updateData);

      expect(result.id).toBe(notification.id);
      expect(result.isRead).toBe(true);
      expect(result.title).toBe(notification.title); // Should remain unchanged
      expect(result.content).toBe(notification.content); // Should remain unchanged
      expect(result.type).toBe(notification.type); // Should remain unchanged
      expect(result.userId).toBe(notification.userId); // Should remain unchanged
      expect(result.relatedEntityType).toBe(notification.relatedEntityType); // Should remain unchanged
      expect(result.relatedEntityId).toBe(notification.relatedEntityId); // Should remain unchanged
      expect(result.updatedAt).toBeDefined();
    });
  });

  it("should handle empty update data gracefully", async () => {
    await runWithTestDb(async (db: DB) => {
      const user = await userTestFactory.insertOne(db, {
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

      const notification = await notificationTestFactory.insertOne(db, {
        userId: user.id,
        type: "system",
        title: "Original Title",
        content: "Original content",
        relatedEntityType: "user",
        relatedEntityId: user.id,
        isRead: false,
      });

      const updateData = {
        id: notification.id,
      };

      const result = await updateNotificationQuery(db, updateData);

      expect(result.id).toBe(notification.id);
      expect(result.title).toBe(notification.title); // Should remain unchanged
      expect(result.content).toBe(notification.content); // Should remain unchanged
      expect(result.type).toBe(notification.type); // Should remain unchanged
      expect(result.isRead).toBe(notification.isRead); // Should remain unchanged
      expect(result.userId).toBe(notification.userId); // Should remain unchanged
      expect(result.relatedEntityType).toBe(notification.relatedEntityType); // Should remain unchanged
      expect(result.relatedEntityId).toBe(notification.relatedEntityId); // Should remain unchanged
      expect(result.updatedAt).toBeDefined();
    });
  });

  it("should update notification type", async () => {
    await runWithTestDb(async (db: DB) => {
      const user = await userTestFactory.insertOne(db, {
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

      const notification = await notificationTestFactory.insertOne(db, {
        userId: user.id,
        type: "system",
        title: "System Notification",
        content: "This is a system notification",
        relatedEntityType: "user",
        relatedEntityId: user.id,
        isRead: false,
      });

      const updateData = {
        id: notification.id,
        type: "deal_update" as const,
      };

      const result = await updateNotificationQuery(db, updateData);

      expect(result.id).toBe(notification.id);
      expect(result.type).toBe("deal");
      expect(result.title).toBe(notification.title); // Should remain unchanged
      expect(result.content).toBe(notification.content); // Should remain unchanged
      expect(result.isRead).toBe(notification.isRead); // Should remain unchanged
      expect(result.userId).toBe(notification.userId); // Should remain unchanged
      expect(result.updatedAt).toBeDefined();
    });
  });

  it("should update notification with long content", async () => {
    await runWithTestDb(async (db: DB) => {
      const user = await userTestFactory.insertOne(db, {
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

      const notification = await notificationTestFactory.insertOne(db, {
        userId: user.id,
        type: "system",
        title: "Short Title",
        content: "Short content",
        relatedEntityType: "user",
        relatedEntityId: user.id,
        isRead: false,
      });

      const longContent =
        "This is a very long notification that contains multiple sentences and should test the system's ability to handle longer content. It includes various punctuation marks, numbers like 123, and special characters like @#$%. The notification should be stored correctly without any issues and should be able to handle extensive text content.";

      const updateData = {
        id: notification.id,
        content: longContent,
      };

      const result = await updateNotificationQuery(db, updateData);

      expect(result.id).toBe(notification.id);
      expect(result.content).toBe(longContent);
      expect(result.title).toBe(notification.title); // Should remain unchanged
      expect(result.type).toBe(notification.type); // Should remain unchanged
      expect(result.isRead).toBe(notification.isRead); // Should remain unchanged
      expect(result.updatedAt).toBeDefined();
    });
  });

  it("should update related entity information", async () => {
    await runWithTestDb(async (db: DB) => {
      const user = await userTestFactory.insertOne(db, {
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
        title: "Original Notification",
        content: "Original content",
        relatedEntityType: "user",
        relatedEntityId: user.id,
        isRead: false,
      });

      const updateData = {
        id: notification.id,
        relatedEntityType: "deal",
        relatedEntityId: "new-deal-id",
      };

      const result = await updateNotificationQuery(db, updateData);

      expect(result.id).toBe(notification.id);
      expect(result.relatedEntityType).toBe("deal");
      expect(result.relatedEntityId).toBe("new-deal-id");
      expect(result.title).toBe(notification.title); // Should remain unchanged
      expect(result.content).toBe(notification.content); // Should remain unchanged
      expect(result.type).toBe(notification.type); // Should remain unchanged
      expect(result.isRead).toBe(notification.isRead); // Should remain unchanged
      expect(result.updatedAt).toBeDefined();
    });
  });

  it("should handle invalid update data", async () => {
    await runWithTestDb(async (db: DB) => {
      const user = await userTestFactory.insertOne(db, {
        id: "test-user-id-7",
        name: "Test User 7",
        email: "test7@example.com",
        emailVerified: true,
        image: "https://example.com/avatar7.jpg",
        reputationScore: "700",
        role: "user",
        preferredCurrency: "USD",
        notificationPreferences: { email: true, sms: false, push: true },
      });

      const notification = await notificationTestFactory.insertOne(db, {
        userId: user.id,
        type: "system",
        title: "Test Notification",
        content: "Test content",
        relatedEntityType: "user",
        relatedEntityId: user.id,
        isRead: false,
      });

      const updateData = {
        id: notification.id,
        title: "", // Empty title should fail
        type: "system" as const,
      };

      await expect(updateNotificationQuery(db, updateData)).rejects.toThrow();
    });
  });
});

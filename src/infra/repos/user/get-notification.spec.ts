import { userTestFactory } from "@/src/domain/auth/user.model.test-factory";
import { notificationTestFactory } from "@/src/domain/tcg/notification.model.test-factory";
import { buildRunWithTestDb, migrateTestDb } from "@/test-db";
import { beforeAll, describe, expect, it } from "vitest";
import { DB } from "../../db/db";
import { getNotificationQuery } from "./get-notification.query";

describe("getNotificationQuery", () => {
  let runWithTestDb: Awaited<ReturnType<typeof buildRunWithTestDb>>;

  beforeAll(async () => {
    await migrateTestDb();
    runWithTestDb = await buildRunWithTestDb();
  });

  it("should successfully retrieve an existing notification", async () => {
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
        title: "Welcome to MTG Peddler!",
        content:
          "Thank you for joining our platform. Start exploring deals and building your collection!",
        relatedEntityType: "user",
        relatedEntityId: user.id,
        isRead: false,
      });

      const result = await getNotificationQuery(db, notification.id);

      expect(result.success).toBe(true);
      expect(result.notification).toBeDefined();
      expect(result.notification?.id).toBe(notification.id);
      expect(result.notification?.userId).toBe(user.id);
      expect(result.notification?.type).toBe("system");
      expect(result.notification?.title).toBe("Welcome to MTG Peddler!");
      expect(result.notification?.content).toBe(
        "Thank you for joining our platform. Start exploring deals and building your collection!"
      );
      expect(result.notification?.relatedEntityType).toBe("user");
      expect(result.notification?.relatedEntityId).toBe(user.id);
      expect(result.notification?.isRead).toBe(false);
      expect(result.error).toBeUndefined();
    });
  });

  it("should return error when notification is not found", async () => {
    await runWithTestDb(async (db: DB) => {
      const nonExistentId = "non-existent-notification-id";

      const result = await getNotificationQuery(db, nonExistentId);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Notification not found");
      expect(result.notification).toBeUndefined();
    });
  });

  it("should handle empty id gracefully", async () => {
    await runWithTestDb(async (db: DB) => {
      const result = await getNotificationQuery(db, "");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Notification not found");
      expect(result.notification).toBeUndefined();
    });
  });

  it("should handle null id gracefully", async () => {
    await runWithTestDb(async (db: DB) => {
      const result = await getNotificationQuery(db, null as unknown as string);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.notification).toBeUndefined();
    });
  });

  it("should handle malformed id gracefully", async () => {
    await runWithTestDb(async (db: DB) => {
      const malformedId = "malformed-id-with-special-chars-!@#$%";

      const result = await getNotificationQuery(db, malformedId);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Notification not found");
      expect(result.notification).toBeUndefined();
    });
  });

  it("should retrieve a read notification", async () => {
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
        title: "Deal Accepted",
        content: "Your deal has been accepted by the seller",
        relatedEntityType: "deal",
        relatedEntityId: "test-deal-id",
        isRead: true,
      });

      const result = await getNotificationQuery(db, readNotification.id);

      expect(result.success).toBe(true);
      expect(result.notification).toBeDefined();
      expect(result.notification?.isRead).toBe(true);
      expect(result.error).toBeUndefined();
    });
  });

  it("should retrieve a notification without related entity", async () => {
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

      const notificationWithoutEntity = await notificationTestFactory.insertOne(
        db,
        {
          userId: user.id,
          type: "system",
          title: "General Notification",
          content: "This is a general system notification",
          relatedEntityType: null,
          relatedEntityId: null,
          isRead: false,
        }
      );

      const result = await getNotificationQuery(
        db,
        notificationWithoutEntity.id
      );

      expect(result.success).toBe(true);
      expect(result.notification).toBeDefined();
      expect(result.notification?.relatedEntityType).toBeNull();
      expect(result.notification?.relatedEntityId).toBeNull();
      expect(result.error).toBeUndefined();
    });
  });

  it("should retrieve a notification with long content", async () => {
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

      const longNotification = await notificationTestFactory.insertOne(db, {
        userId: user.id,
        type: "system",
        title: "Long Content Notification",
        content: longContent,
        relatedEntityType: "user",
        relatedEntityId: user.id,
        isRead: false,
      });

      const result = await getNotificationQuery(db, longNotification.id);

      expect(result.success).toBe(true);
      expect(result.notification).toBeDefined();
      expect(result.notification?.content).toBe(longContent);
      expect(result.error).toBeUndefined();
    });
  });

  it("should retrieve different notification types", async () => {
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

      const result1 = await getNotificationQuery(db, systemNotification.id);
      const result2 = await getNotificationQuery(db, dealNotification.id);

      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);
      expect(result1.notification?.type).toBe("system");
      expect(result2.notification?.type).toBe("deal_update");
      expect(result1.error).toBeUndefined();
      expect(result2.error).toBeUndefined();
    });
  });

  it("should retrieve a notification with special characters in content", async () => {
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

      const specialContent =
        "Notification with special chars: @#$%^&*()_+-=[]{}|;':\",./<>?`~";

      const specialNotification = await notificationTestFactory.insertOne(db, {
        userId: user.id,
        type: "system",
        title: "Special Characters Notification",
        content: specialContent,
        relatedEntityType: "user",
        relatedEntityId: user.id,
        isRead: false,
      });

      const result = await getNotificationQuery(db, specialNotification.id);

      expect(result.success).toBe(true);
      expect(result.notification).toBeDefined();
      expect(result.notification?.content).toBe(specialContent);
      expect(result.error).toBeUndefined();
    });
  });
});

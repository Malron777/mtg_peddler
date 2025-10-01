import { userTestFactory } from "@/src/domain/auth/user.model.test-factory";
import { notificationTestFactory } from "@/src/domain/tcg/notification.model.test-factory";
import { buildRunWithTestDb, migrateTestDb } from "@/test-db";
import { beforeAll, describe, expect, it } from "vitest";
import { DB } from "../../db/db";
import { createNotificationQuery } from "./create-notification.query";

describe("createNotificationQuery", () => {
  let runWithTestDb: Awaited<ReturnType<typeof buildRunWithTestDb>>;

  beforeAll(async () => {
    await migrateTestDb();
    runWithTestDb = await buildRunWithTestDb();
  });

  it("should successfully create a notification", async () => {
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

      const notificationData = notificationTestFactory.buildOne({
        userId: user.id,
        type: "system",
        title: "Welcome to MTG Peddler!",
        content:
          "Thank you for joining our platform. Start exploring deals and building your collection!",
        relatedEntityType: "user",
        relatedEntityId: user.id,
        isRead: false,
      });

      const result = await createNotificationQuery(db, notificationData);

      expect(result.success).toBe(true);
      expect(result.notification).toBeDefined();
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

  it("should create a notification with minimal data", async () => {
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

      const notificationData = notificationTestFactory.buildOne({
        userId: user.id,
        type: "deal_update",
        title: "New Deal Available",
        content: "A new deal has been posted",
        relatedEntityType: null,
        relatedEntityId: null,
        isRead: true,
      });

      const result = await createNotificationQuery(db, notificationData);

      expect(result.success).toBe(true);
      expect(result.notification).toBeDefined();
      expect(result.notification?.userId).toBe(user.id);
      expect(result.notification?.type).toBe("deal_update");
      expect(result.notification?.title).toBe("New Deal Available");
      expect(result.notification?.content).toBe("A new deal has been posted");
      expect(result.notification?.relatedEntityType).toBeNull();
      expect(result.notification?.relatedEntityId).toBeNull();
      expect(result.notification?.isRead).toBe(true);
      expect(result.error).toBeUndefined();
    });
  });

  it("should handle invalid user ID gracefully", async () => {
    await runWithTestDb(async (db: DB) => {
      const notificationData = notificationTestFactory.buildOne({
        userId: "non-existent-user-id",
        type: "system",
        title: "Test Notification",
        content: "This is a test notification",
        relatedEntityType: "user",
        relatedEntityId: "non-existent-user-id",
        isRead: false,
      });

      const result = await createNotificationQuery(db, notificationData);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.notification).toBeUndefined();
    });
  });

  it("should handle missing required fields", async () => {
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

      const notificationData = notificationTestFactory.buildOne({
        userId: user.id,
        type: "system",
        title: null as unknown as string, // Empty title should fail
        content: "This is a test notification",
        relatedEntityType: "user",
        relatedEntityId: user.id,
        isRead: false,
      });

      const result = await createNotificationQuery(db, notificationData);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.notification).toBeUndefined();
    });
  });

  it("should create multiple notifications for the same user", async () => {
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

      const notification1Data = notificationTestFactory.buildOne({
        userId: user.id,
        type: "system",
        title: "First Notification",
        content: "This is the first notification",
        relatedEntityType: "user",
        relatedEntityId: user.id,
        isRead: false,
      });

      const notification2Data = notificationTestFactory.buildOne({
        userId: user.id,
        type: "message",
        title: "Second Notification",
        content: "This is the second notification",
        relatedEntityType: "deal",
        relatedEntityId: "test-deal-id",
        isRead: true,
      });

      const result1 = await createNotificationQuery(db, notification1Data);
      const result2 = await createNotificationQuery(db, notification2Data);

      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);
      expect(result1.notification?.title).toBe("First Notification");
      expect(result2.notification?.title).toBe("Second Notification");
      expect(result1.notification?.isRead).toBe(false);
      expect(result2.notification?.isRead).toBe(true);
    });
  });

  it("should handle different notification types", async () => {
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

      const systemNotification = notificationTestFactory.buildOne({
        userId: user.id,
        type: "system",
        title: "System Notification",
        content: "This is a system notification",
        relatedEntityType: "user",
        relatedEntityId: user.id,
        isRead: false,
      });

      const dealNotification = notificationTestFactory.buildOne({
        userId: user.id,
        type: "message",
        title: "Deal Notification",
        content: "This is a deal notification",
        relatedEntityType: "deal",
        relatedEntityId: "test-deal-id",
        isRead: false,
      });

      const result1 = await createNotificationQuery(db, systemNotification);
      const result2 = await createNotificationQuery(db, dealNotification);

      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);
      expect(result1.notification?.type).toBe("system");
      expect(result2.notification?.type).toBe("message");
    });
  });

  it("should handle long notification content", async () => {
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

      const longContent =
        "This is a very long notification that contains multiple sentences and should test the system's ability to handle longer content. It includes various punctuation marks, numbers like 123, and special characters like @#$%. The notification should be stored correctly without any issues and should be able to handle extensive text content.";

      const notificationData = notificationTestFactory.buildOne({
        userId: user.id,
        type: "system",
        title: "Long Content Notification",
        content: longContent,
        relatedEntityType: "user",
        relatedEntityId: user.id,
        isRead: false,
      });

      const result = await createNotificationQuery(db, notificationData);

      expect(result.success).toBe(true);
      expect(result.notification).toBeDefined();
      expect(result.notification?.content).toBe(longContent);
      expect(result.error).toBeUndefined();
    });
  });

  it("should create notification with different related entity types", async () => {
    await runWithTestDb(async (db: DB) => {
      const user = await userTestFactory.buildAndInsertOne(db, {
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

      const userNotification = notificationTestFactory.buildOne({
        userId: user.id,
        type: "system",
        title: "User Related Notification",
        content: "This notification is related to a user",
        relatedEntityType: "user",
        relatedEntityId: user.id,
        isRead: false,
      });

      const dealNotification = notificationTestFactory.buildOne({
        userId: user.id,
        type: "message",
        title: "Deal Related Notification",
        content: "This notification is related to a deal",
        relatedEntityType: "deal",
        relatedEntityId: "test-deal-id",
        isRead: false,
      });

      const result1 = await createNotificationQuery(db, userNotification);
      const result2 = await createNotificationQuery(db, dealNotification);

      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);
      expect(result1.notification?.relatedEntityType).toBe("user");
      expect(result2.notification?.relatedEntityType).toBe("deal");
      expect(result1.notification?.relatedEntityId).toBe(user.id);
      expect(result2.notification?.relatedEntityId).toBe("test-deal-id");
    });
  });
});

import { userTestFactory } from "@/src/domain/auth/user.model.test-factory";
import { messageTestFactory } from "@/src/domain/tcg/message.model.test-factory";
import { buildRunWithTestDb, migrateTestDb } from "@/test-db";
import { beforeAll, describe, expect, it } from "vitest";
import { DB } from "../../db/db";
import { createMessageQuery } from "./create-message.query";

describe("createMessageQuery", () => {
  let runWithTestDb: Awaited<ReturnType<typeof buildRunWithTestDb>>;

  beforeAll(async () => {
    await migrateTestDb();
    runWithTestDb = await buildRunWithTestDb();
  });

  it("should successfully create a message", async () => {
    await runWithTestDb(async (db: DB) => {
      const sender = await userTestFactory.buildAndInsertOne(db, {
        id: "test-sender-id-1",
        name: "Test Sender",
        email: "sender@example.com",
        emailVerified: true,
        image: "https://example.com/sender-avatar.jpg",
        reputationScore: "100",
        role: "user",
        preferredCurrency: "USD",
        notificationPreferences: { email: true, sms: false, push: true },
      });

      const recipient = await userTestFactory.buildAndInsertOne(db, {
        id: "test-recipient-id-1",
        name: "Test Recipient",
        email: "recipient@example.com",
        emailVerified: true,
        image: "https://example.com/recipient-avatar.jpg",
        reputationScore: "200",
        role: "user",
        preferredCurrency: "EUR",
        notificationPreferences: { email: true, sms: true, push: true },
      });

      const messageData = messageTestFactory.buildOne({
        dealId: null,
        senderId: sender.id,
        recipientId: recipient.id,
        content: "Hello, this is a test message!",
        isRead: false,
      });

      const result = await createMessageQuery(db, messageData);

      expect(result.success).toBe(true);
      expect(result.message).toBeDefined();
      expect(result.message?.dealId).toBe(null);
      expect(result.message?.senderId).toBe(sender.id);
      expect(result.message?.recipientId).toBe(recipient.id);
      expect(result.message?.content).toBe("Hello, this is a test message!");
      expect(result.message?.isRead).toBe(false);
      expect(result.error).toBeUndefined();
    });
  });

  it("should create a message with minimal data", async () => {
    await runWithTestDb(async (db: DB) => {
      const sender = await userTestFactory.buildAndInsertOne(db, {
        id: "test-sender-id-2",
        name: "Test Sender 2",
        email: "sender2@example.com",
        emailVerified: true,
        image: "https://example.com/sender2-avatar.jpg",
        reputationScore: "300",
        role: "user",
        preferredCurrency: "USD",
        notificationPreferences: { email: true, sms: false, push: true },
      });

      const recipient = await userTestFactory.buildAndInsertOne(db, {
        id: "test-recipient-id-2",
        name: "Test Recipient 2",
        email: "recipient2@example.com",
        emailVerified: true,
        image: "https://example.com/recipient2-avatar.jpg",
        reputationScore: "400",
        role: "user",
        preferredCurrency: "EUR",
        notificationPreferences: { email: true, sms: true, push: true },
      });

      const messageData = messageTestFactory.buildOne({
        dealId: null, // Optional deal ID
        senderId: sender.id,
        recipientId: recipient.id,
        content: "Short message",
        isRead: true,
      });

      const result = await createMessageQuery(db, messageData);

      expect(result.success).toBe(true);
      expect(result.message).toBeDefined();
      expect(result.message?.dealId).toBeNull();
      expect(result.message?.senderId).toBe(sender.id);
      expect(result.message?.recipientId).toBe(recipient.id);
      expect(result.message?.content).toBe("Short message");
      expect(result.message?.isRead).toBe(true);
      expect(result.error).toBeUndefined();
    });
  });

  it("should handle invalid sender ID gracefully", async () => {
    await runWithTestDb(async (db: DB) => {
      const recipient = await userTestFactory.buildAndInsertOne(db, {
        id: "test-recipient-id-3",
        name: "Test Recipient 3",
        email: "recipient3@example.com",
        emailVerified: true,
        image: "https://example.com/recipient3-avatar.jpg",
        reputationScore: "500",
        role: "user",
        preferredCurrency: "USD",
        notificationPreferences: { email: true, sms: false, push: true },
      });

      const messageData = messageTestFactory.buildOne({
        dealId: "test-deal-id-3",
        senderId: "non-existent-sender-id",
        recipientId: recipient.id,
        content: "Test message",
        isRead: false,
      });

      const result = await createMessageQuery(db, messageData);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.message).toBeUndefined();
    });
  });

  it("should handle invalid recipient ID gracefully", async () => {
    await runWithTestDb(async (db: DB) => {
      const sender = await userTestFactory.buildAndInsertOne(db, {
        id: "test-sender-id-4",
        name: "Test Sender 4",
        email: "sender4@example.com",
        emailVerified: true,
        image: "https://example.com/sender4-avatar.jpg",
        reputationScore: "600",
        role: "user",
        preferredCurrency: "USD",
        notificationPreferences: { email: true, sms: false, push: true },
      });

      const messageData = messageTestFactory.buildOne({
        dealId: "test-deal-id-4",
        senderId: sender.id,
        recipientId: "non-existent-recipient-id",
        content: "Test message",
        isRead: false,
      });

      const result = await createMessageQuery(db, messageData);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.message).toBeUndefined();
    });
  });

  it("should handle missing required fields", async () => {
    await runWithTestDb(async (db: DB) => {
      const sender = await userTestFactory.buildAndInsertOne(db, {
        id: "test-sender-id-5",
        name: "Test Sender 5",
        email: "sender5@example.com",
        emailVerified: true,
        image: "https://example.com/sender5-avatar.jpg",
        reputationScore: "700",
        role: "user",
        preferredCurrency: "USD",
        notificationPreferences: { email: true, sms: false, push: true },
      });

      const recipient = await userTestFactory.buildAndInsertOne(db, {
        id: "test-recipient-id-5",
        name: "Test Recipient 5",
        email: "recipient5@example.com",
        emailVerified: true,
        image: "https://example.com/recipient5-avatar.jpg",
        reputationScore: "800",
        role: "user",
        preferredCurrency: "EUR",
        notificationPreferences: { email: true, sms: true, push: true },
      });

      const messageData = messageTestFactory.buildOne({
        dealId: "test-deal-id-5",
        senderId: sender.id,
        recipientId: recipient.id,
        content: "", // Empty content should fail
        isRead: false,
      });

      const result = await createMessageQuery(db, messageData);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.message).toBeUndefined();
    });
  });

  it("should create multiple messages between the same users", async () => {
    await runWithTestDb(async (db: DB) => {
      const sender = await userTestFactory.buildAndInsertOne(db, {
        id: "test-sender-id-6",
        name: "Test Sender 6",
        email: "sender6@example.com",
        emailVerified: true,
        image: "https://example.com/sender6-avatar.jpg",
        reputationScore: "900",
        role: "user",
        preferredCurrency: "USD",
        notificationPreferences: { email: true, sms: false, push: true },
      });

      const recipient = await userTestFactory.buildAndInsertOne(db, {
        id: "test-recipient-id-6",
        name: "Test Recipient 6",
        email: "recipient6@example.com",
        emailVerified: true,
        image: "https://example.com/recipient6-avatar.jpg",
        reputationScore: "1000",
        role: "user",
        preferredCurrency: "EUR",
        notificationPreferences: { email: true, sms: true, push: true },
      });

      const message1Data = messageTestFactory.buildOne({
        dealId: null,
        senderId: sender.id,
        recipientId: recipient.id,
        content: "First message",
        isRead: false,
      });

      const message2Data = messageTestFactory.buildOne({
        dealId: null,
        senderId: recipient.id,
        recipientId: sender.id,
        content: "Reply message",
        isRead: false,
      });

      const result1 = await createMessageQuery(db, message1Data);
      const result2 = await createMessageQuery(db, message2Data);

      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);
      expect(result1.message?.content).toBe("First message");
      expect(result2.message?.content).toBe("Reply message");
      expect(result1.message?.senderId).toBe(sender.id);
      expect(result2.message?.senderId).toBe(recipient.id);
    });
  });

  it("should handle long message content", async () => {
    await runWithTestDb(async (db: DB) => {
      const sender = await userTestFactory.buildAndInsertOne(db, {
        id: "test-sender-id-7",
        name: "Test Sender 7",
        email: "sender7@example.com",
        emailVerified: true,
        image: "https://example.com/sender7-avatar.jpg",
        reputationScore: "1100",
        role: "user",
        preferredCurrency: "USD",
        notificationPreferences: { email: true, sms: false, push: true },
      });

      const recipient = await userTestFactory.buildAndInsertOne(db, {
        id: "test-recipient-id-7",
        name: "Test Recipient 7",
        email: "recipient7@example.com",
        emailVerified: true,
        image: "https://example.com/recipient7-avatar.jpg",
        reputationScore: "1200",
        role: "user",
        preferredCurrency: "EUR",
        notificationPreferences: { email: true, sms: true, push: true },
      });

      const longContent =
        "This is a very long message that contains multiple sentences and should test the system's ability to handle longer content. It includes various punctuation marks, numbers like 123, and special characters like @#$%. The message should be stored correctly without any issues.";

      const messageData = messageTestFactory.buildOne({
        dealId: null,
        senderId: sender.id,
        recipientId: recipient.id,
        content: longContent,
        isRead: false,
      });

      const result = await createMessageQuery(db, messageData);

      expect(result.success).toBe(true);
      expect(result.message).toBeDefined();
      expect(result.message?.content).toBe(longContent);
      expect(result.error).toBeUndefined();
    });
  });
});

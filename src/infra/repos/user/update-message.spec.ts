import { userTestFactory } from "@/src/domain/auth/user.model.test-factory";
import { dealTestFactory } from "@/src/domain/tcg/deal.model.test-factory";
import { messageTestFactory } from "@/src/domain/tcg/message.model.test-factory";
import { buildRunWithTestDb, migrateTestDb } from "@/test-db";
import { beforeAll, describe, expect, it } from "vitest";
import { DB } from "../../db/db";
import { updateMessageQuery } from "./update-message.query";

describe("updateMessageQuery", () => {
  let runWithTestDb: Awaited<ReturnType<typeof buildRunWithTestDb>>;

  beforeAll(async () => {
    await migrateTestDb();
    runWithTestDb = await buildRunWithTestDb();
  });

  it("should successfully update an existing message", async () => {
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

      const deal = await dealTestFactory.insertOne(db, {
        id: "test-deal-id-1",
        sellerId: sender.id,
        buyerId: recipient.id,
        status: "negotiating",
        totalAmount: "1300",
        paymentMethodId: null,
        shippingLocationId: null,
      });

      const message = await messageTestFactory.insertOne(db, {
        dealId: deal.id,
        senderId: sender.id,
        recipientId: recipient.id,
        content: "Original message content",
        isRead: false,
      });

      const updateData = {
        id: message.id,
        content: "Updated message content",
        isRead: true,
      };

      const result = await updateMessageQuery(db, updateData);

      expect(result.id).toBe(message.id);
      expect(result.content).toBe("Updated message content");
      expect(result.isRead).toBe(true);
      expect(result.dealId).toBe(message.dealId); // Should remain unchanged
      expect(result.senderId).toBe(message.senderId); // Should remain unchanged
      expect(result.recipientId).toBe(message.recipientId); // Should remain unchanged
      expect(result.updatedAt).toBeDefined();
      expect(result.updatedAt.getTime()).toBeGreaterThan(
        message.updatedAt.getTime()
      );
    });
  });

  it("should return undefined when trying to update non-existent message", async () => {
    await runWithTestDb(async (db: DB) => {
      const updateData = {
        id: "non-existent-message-id",
        content: "Updated content",
        isRead: true,
      };

      const result = await updateMessageQuery(db, updateData);

      expect(result).toBeUndefined();
    });
  });

  it("should handle partial updates correctly", async () => {
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

      const message = await messageTestFactory.insertOne(db, {
        dealId: null,
        senderId: sender.id,
        recipientId: recipient.id,
        content: "Original message",
        isRead: false,
      });

      const updateData = {
        id: message.id,
        isRead: true,
      };

      const result = await updateMessageQuery(db, updateData);

      expect(result.id).toBe(message.id);
      expect(result.isRead).toBe(true);
      expect(result.content).toBe(message.content); // Should remain unchanged
      expect(result.dealId).toBe(message.dealId); // Should remain unchanged
      expect(result.senderId).toBe(message.senderId); // Should remain unchanged
      expect(result.recipientId).toBe(message.recipientId); // Should remain unchanged
      expect(result.updatedAt).toBeDefined();
    });
  });

  it("should handle empty update data gracefully", async () => {
    await runWithTestDb(async (db: DB) => {
      const sender = await userTestFactory.buildAndInsertOne(db, {
        id: "test-sender-id-3",
        name: "Test Sender 3",
        email: "sender3@example.com",
        emailVerified: true,
        image: "https://example.com/sender3-avatar.jpg",
        reputationScore: "500",
        role: "user",
        preferredCurrency: "USD",
        notificationPreferences: { email: true, sms: false, push: true },
      });

      const recipient = await userTestFactory.buildAndInsertOne(db, {
        id: "test-recipient-id-3",
        name: "Test Recipient 3",
        email: "recipient3@example.com",
        emailVerified: true,
        image: "https://example.com/recipient3-avatar.jpg",
        reputationScore: "600",
        role: "user",
        preferredCurrency: "EUR",
        notificationPreferences: { email: true, sms: true, push: true },
      });

      const message = await messageTestFactory.insertOne(db, {
        dealId: null,
        senderId: sender.id,
        recipientId: recipient.id,
        content: "Original message",
        isRead: false,
      });

      const updateData = {
        id: message.id,
      };

      const result = await updateMessageQuery(db, updateData);

      expect(result.id).toBe(message.id);
      expect(result.content).toBe(message.content); // Should remain unchanged
      expect(result.isRead).toBe(message.isRead); // Should remain unchanged
      expect(result.dealId).toBe(message.dealId); // Should remain unchanged
      expect(result.senderId).toBe(message.senderId); // Should remain unchanged
      expect(result.recipientId).toBe(message.recipientId); // Should remain unchanged
      expect(result.updatedAt).toBeDefined();
    });
  });

  it("should update message content only", async () => {
    await runWithTestDb(async (db: DB) => {
      const sender = await userTestFactory.buildAndInsertOne(db, {
        id: "test-sender-id-4",
        name: "Test Sender 4",
        email: "sender4@example.com",
        emailVerified: true,
        image: "https://example.com/sender4-avatar.jpg",
        reputationScore: "700",
        role: "user",
        preferredCurrency: "USD",
        notificationPreferences: { email: true, sms: false, push: true },
      });

      const recipient = await userTestFactory.buildAndInsertOne(db, {
        id: "test-recipient-id-4",
        name: "Test Recipient 4",
        email: "recipient4@example.com",
        emailVerified: true,
        image: "https://example.com/recipient4-avatar.jpg",
        reputationScore: "800",
        role: "user",
        preferredCurrency: "EUR",
        notificationPreferences: { email: true, sms: true, push: true },
      });

      const message = await messageTestFactory.insertOne(db, {
        dealId: null,
        senderId: sender.id,
        recipientId: recipient.id,
        content: "Original content",
        isRead: false,
      });

      const updateData = {
        id: message.id,
        content: "Updated content only",
      };

      const result = await updateMessageQuery(db, updateData);

      expect(result.id).toBe(message.id);
      expect(result.content).toBe("Updated content only");
      expect(result.isRead).toBe(message.isRead); // Should remain unchanged
      expect(result.dealId).toBe(message.dealId); // Should remain unchanged
      expect(result.senderId).toBe(message.senderId); // Should remain unchanged
      expect(result.recipientId).toBe(message.recipientId); // Should remain unchanged
      expect(result.updatedAt).toBeDefined();
    });
  });

  it("should update message with long content", async () => {
    await runWithTestDb(async (db: DB) => {
      const sender = await userTestFactory.buildAndInsertOne(db, {
        id: "test-sender-id-5",
        name: "Test Sender 5",
        email: "sender5@example.com",
        emailVerified: true,
        image: "https://example.com/sender5-avatar.jpg",
        reputationScore: "900",
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
        reputationScore: "1000",
        role: "user",
        preferredCurrency: "EUR",
        notificationPreferences: { email: true, sms: true, push: true },
      });

      const message = await messageTestFactory.insertOne(db, {
        dealId: null,
        senderId: sender.id,
        recipientId: recipient.id,
        content: "Short content",
        isRead: false,
      });

      const longContent =
        "This is a very long message that contains multiple sentences and should test the system's ability to handle longer content. It includes various punctuation marks, numbers like 123, and special characters like @#$%. The message should be stored correctly without any issues.";

      const updateData = {
        id: message.id,
        content: longContent,
      };

      const result = await updateMessageQuery(db, updateData);

      expect(result.id).toBe(message.id);
      expect(result.content).toBe(longContent);
      expect(result.isRead).toBe(message.isRead); // Should remain unchanged
      expect(result.updatedAt).toBeDefined();
    });
  });

  it("should handle invalid update data", async () => {
    await runWithTestDb(async (db: DB) => {
      const sender = await userTestFactory.buildAndInsertOne(db, {
        id: "test-sender-id-6",
        name: "Test Sender 6",
        email: "sender6@example.com",
        emailVerified: true,
        image: "https://example.com/sender6-avatar.jpg",
        reputationScore: "1100",
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
        reputationScore: "1200",
        role: "user",
        preferredCurrency: "EUR",
        notificationPreferences: { email: true, sms: true, push: true },
      });

      const message = await messageTestFactory.insertOne(db, {
        dealId: null,
        senderId: sender.id,
        recipientId: recipient.id,
        content: "Original content",
        isRead: false,
      });

      const updateData = {
        id: message.id,
        content: "", // Empty content should fail
        senderId: "invalid-sender-id", // Invalid sender ID should fail
      };

      await expect(updateMessageQuery(db, updateData)).rejects.toThrow();
    });
  });
});

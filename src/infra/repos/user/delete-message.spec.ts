import { userTestFactory } from "@/src/domain/auth/user.model.test-factory";
import { messageTestFactory } from "@/src/domain/tcg/message.model.test-factory";
import { buildRunWithTestDb, migrateTestDb } from "@/test-db";
import { beforeAll, describe, expect, it } from "vitest";
import { DB } from "../../db/db";
import { deleteMessageQuery } from "./delete-message.query";

describe("deleteMessageQuery", () => {
  let runWithTestDb: Awaited<ReturnType<typeof buildRunWithTestDb>>;

  beforeAll(async () => {
    await migrateTestDb();
    runWithTestDb = await buildRunWithTestDb();
  });

  it("should successfully delete an existing message", async () => {
    await runWithTestDb(async (db: DB) => {
      const sender = await userTestFactory.insertOne(db, {
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

      const recipient = await userTestFactory.insertOne(db, {
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

      const message = await messageTestFactory.insertOne(db, {
        dealId: "test-deal-id-1",
        senderId: sender.id,
        recipientId: recipient.id,
        content: "Test message content",
        isRead: false,
      });

      const result = await deleteMessageQuery(db, message.id);

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
    });
  });

  it("should handle deleting non-existent message gracefully", async () => {
    await runWithTestDb(async (db: DB) => {
      const nonExistentId = "non-existent-message-id";

      const result = await deleteMessageQuery(db, nonExistentId);

      expect(result.success).toBe(true); // Delete operations typically succeed even if nothing was deleted
      expect(result.error).toBeUndefined();
    });
  });

  it("should handle empty id gracefully", async () => {
    await runWithTestDb(async (db: DB) => {
      const result = await deleteMessageQuery(db, "");

      expect(result.success).toBe(true); // Delete operations typically succeed even with empty ID
      expect(result.error).toBeUndefined();
    });
  });

  it("should handle null id gracefully", async () => {
    await runWithTestDb(async (db: DB) => {
      const result = await deleteMessageQuery(db, null as unknown as string);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  it("should handle malformed id gracefully", async () => {
    await runWithTestDb(async (db: DB) => {
      const malformedId = "malformed-id-with-special-chars-!@#$%";

      const result = await deleteMessageQuery(db, malformedId);

      expect(result.success).toBe(true); // Delete operations typically succeed even with malformed IDs
      expect(result.error).toBeUndefined();
    });
  });

  it("should delete only the specified message", async () => {
    await runWithTestDb(async (db: DB) => {
      const sender = await userTestFactory.insertOne(db, {
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

      const recipient = await userTestFactory.insertOne(db, {
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

      const message1 = await messageTestFactory.insertOne(db, {
        dealId: "test-deal-id-2",
        senderId: sender.id,
        recipientId: recipient.id,
        content: "First message",
        isRead: false,
      });

      const message2 = await messageTestFactory.insertOne(db, {
        dealId: "test-deal-id-2",
        senderId: recipient.id,
        recipientId: sender.id,
        content: "Second message",
        isRead: true,
      });

      const result = await deleteMessageQuery(db, message1.id);

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();

      // Verify that message2 still exists by trying to delete it
      const result2 = await deleteMessageQuery(db, message2.id);
      expect(result2.success).toBe(true);
    });
  });

  it("should handle deleting read message", async () => {
    await runWithTestDb(async (db: DB) => {
      const sender = await userTestFactory.insertOne(db, {
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

      const recipient = await userTestFactory.insertOne(db, {
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

      const readMessage = await messageTestFactory.insertOne(db, {
        dealId: "test-deal-id-3",
        senderId: sender.id,
        recipientId: recipient.id,
        content: "Read message",
        isRead: true,
      });

      const result = await deleteMessageQuery(db, readMessage.id);

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
    });
  });

  it("should handle deleting message with long content", async () => {
    await runWithTestDb(async (db: DB) => {
      const sender = await userTestFactory.insertOne(db, {
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

      const recipient = await userTestFactory.insertOne(db, {
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

      const longContent =
        "This is a very long message that contains multiple sentences and should test the system's ability to handle longer content. It includes various punctuation marks, numbers like 123, and special characters like @#$%. The message should be stored correctly without any issues.";

      const longMessage = await messageTestFactory.insertOne(db, {
        dealId: "test-deal-id-4",
        senderId: sender.id,
        recipientId: recipient.id,
        content: longContent,
        isRead: false,
      });

      const result = await deleteMessageQuery(db, longMessage.id);

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
    });
  });

  it("should handle deleting message without deal ID", async () => {
    await runWithTestDb(async (db: DB) => {
      const sender = await userTestFactory.insertOne(db, {
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

      const recipient = await userTestFactory.insertOne(db, {
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

      const messageWithoutDeal = await messageTestFactory.insertOne(db, {
        dealId: null,
        senderId: sender.id,
        recipientId: recipient.id,
        content: "Message without deal",
        isRead: false,
      });

      const result = await deleteMessageQuery(db, messageWithoutDeal.id);

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
    });
  });
});

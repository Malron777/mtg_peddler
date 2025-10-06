import { DB } from "@/src/infra/db/db";
import { messages } from "@/src/infra/db/schema/tcg";
import { userTestFactory } from "../auth/user.model.test-factory";
import { Message } from "./message.model";

export const messageTestFactory = {
  buildOne(overrides: Partial<Message>): Message {
    return {
      id: crypto.randomUUID(),
      dealId: crypto.randomUUID(),
      senderId: crypto.randomUUID(),
      recipientId: crypto.randomUUID(),
      content: "Test message content",
      isRead: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    };
  },

  async insertOne(db: DB, overrides: Partial<Message>): Promise<Message> {
    const message = this.buildOne(overrides);
    const result = await db.insert(messages).values(message).returning();
    return result[0];
  },

  async buildAndInsertOne(
    db: DB,
    overrides: Partial<Message>
  ): Promise<Message> {
    const message = this.buildOne(overrides);
    const result = await db.insert(messages).values(message).returning();
    return result[0];
  },

  async buildAndInsertOneWithDependencies(
    db: DB,
    overrides: Partial<Message>
  ): Promise<Message> {
    // Create dependencies if not provided
    const senderId =
      overrides.senderId ||
      (await userTestFactory.buildAndInsertOne(db, {})).id;
    const recipientId =
      overrides.recipientId ||
      (await userTestFactory.buildAndInsertOne(db, {})).id;

    // Optional dependencies
    const dealId = overrides.dealId;

    // Build and insert with dependencies
    const message = this.buildOne({
      ...overrides,
      senderId,
      recipientId,
      dealId,
    });
    const result = await db.insert(messages).values(message).returning();
    return result[0];
  },
};

import { DB } from "@/src/infra/db/db";
import { messages } from "@/src/infra/db/schema/tcg";
import { Message } from "./message.model";

export function buildOne(overrides: Partial<Message>): Message {
  return {
    ...overrides,
    id: crypto.randomUUID(),
    dealId: crypto.randomUUID(),
    senderId: crypto.randomUUID(),
    recipientId: crypto.randomUUID(),
    content: "Test message content",
    isRead: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

export async function insertOne(
  db: DB,
  overrides: Partial<Message>
): Promise<Message> {
  const message = buildOne(overrides);
  const result = await db.insert(messages).values(message).returning();
  return result[0];
}

export async function buildAndInsertOne(
  db: DB,
  overrides: Partial<Message>
): Promise<Message> {
  const message = buildOne(overrides);
  const result = await db.insert(messages).values(message).returning();
  return result[0];
}

export async function buildAndInsertOneWithDependencies(
  db: DB,
  overrides: Partial<Message>
): Promise<Message> {
  // Import the required factories
  const { buildAndInsertOne: buildUser } = await import(
    "../auth/user.model.test-factory"
  );

  // Create dependencies if not provided
  const senderId = overrides.senderId || (await buildUser(db, {})).id;
  const recipientId = overrides.recipientId || (await buildUser(db, {})).id;

  // Optional dependencies
  const dealId = overrides.dealId;

  // Build and insert with dependencies
  const message = buildOne({
    ...overrides,
    senderId,
    recipientId,
    dealId,
  });
  const result = await db.insert(messages).values(message).returning();
  return result[0];
}

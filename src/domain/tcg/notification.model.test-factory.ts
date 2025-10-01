import { DB } from "@/src/infra/db/db";
import { notifications } from "@/src/infra/db/schema/tcg";
import { Notification } from "./notification.model";

export function buildOne(overrides: Partial<Notification>): Notification {
  return {
    ...overrides,
    id: crypto.randomUUID(),
    userId: crypto.randomUUID(),
    type: "system",
    title: "Test Notification",
    content: "This is a test notification",
    relatedEntityType: "deal",
    relatedEntityId: crypto.randomUUID(),
    isRead: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

export async function insertOne(
  db: DB,
  overrides: Partial<Notification>
): Promise<Notification> {
  const notification = buildOne(overrides);
  const result = await db
    .insert(notifications)
    .values(notification)
    .returning();
  return result[0];
}

export async function buildAndInsertOne(
  db: DB,
  overrides: Partial<Notification>
): Promise<Notification> {
  const notification = buildOne(overrides);
  const result = await db
    .insert(notifications)
    .values(notification)
    .returning();
  return result[0];
}

export async function buildAndInsertOneWithDependencies(
  db: DB,
  overrides: Partial<Notification>
): Promise<Notification> {
  // Import the required factories
  const { buildAndInsertOne: buildUser } = await import(
    "../auth/user.model.test-factory"
  );

  // Create dependencies if not provided
  const userId = overrides.userId || (await buildUser(db, {})).id;

  // Optional dependencies - these are just IDs, not foreign keys to other tables
  const relatedEntityType = overrides.relatedEntityType;
  const relatedEntityId = overrides.relatedEntityId;

  // Build and insert with dependencies
  const notification = buildOne({
    ...overrides,
    userId,
    relatedEntityType,
    relatedEntityId,
  });
  const result = await db
    .insert(notifications)
    .values(notification)
    .returning();
  return result[0];
}

import { DB } from "@/src/infra/db/db";
import { notifications } from "@/src/infra/db/schema/tcg";
import { userTestFactory } from "../auth/user.model.test-factory";
import { Notification } from "./notification.model";

export const notificationTestFactory = {
  buildOne(overrides: Partial<Notification>): Notification {
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
  },

  async insertOne(
    db: DB,
    overrides: Partial<Notification>
  ): Promise<Notification> {
    const notification = this.buildOne(overrides);
    const result = await db
      .insert(notifications)
      .values(notification)
      .returning();
    return result[0];
  },

  async buildAndInsertOne(
    db: DB,
    overrides: Partial<Notification>
  ): Promise<Notification> {
    const notification = this.buildOne(overrides);
    const result = await db
      .insert(notifications)
      .values(notification)
      .returning();
    return result[0];
  },

  async buildAndInsertOneWithDependencies(
    db: DB,
    overrides: Partial<Notification>
  ): Promise<Notification> {
    // Create dependencies if not provided
    const userId =
      overrides.userId || (await userTestFactory.buildAndInsertOne(db, {})).id;

    // Optional dependencies - these are just IDs, not foreign keys to other tables
    const relatedEntityType = overrides.relatedEntityType;
    const relatedEntityId = overrides.relatedEntityId;

    // Build and insert with dependencies
    const notification = this.buildOne({
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
  },
};

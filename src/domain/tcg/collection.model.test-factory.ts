import { DB } from "@/src/infra/db/db";
import { collections } from "@/src/infra/db/schema/tcg";
import { userTestFactory } from "../auth/user.model.test-factory";
import { Collection } from "./collection.model";

export const collectionTestFactory = {
  buildOne(overrides: Partial<Collection>): Collection {
    return {
      ...overrides,
      id: crypto.randomUUID(),
      userId: crypto.randomUUID(),
      name: "Test Collection",
      description: "A test collection for testing purposes",
      isPublic: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  },

  async insertOne(db: DB, overrides: Partial<Collection>): Promise<Collection> {
    const collection = this.buildOne(overrides);
    const result = await db.insert(collections).values(collection).returning();
    return result[0];
  },

  async buildAndInsertOne(
    db: DB,
    overrides: Partial<Collection>
  ): Promise<Collection> {
    const collection = this.buildOne(overrides);
    const result = await db.insert(collections).values(collection).returning();
    return result[0];
  },

  async buildAndInsertOneWithDependencies(
    db: DB,
    overrides: Partial<Collection>
  ): Promise<Collection> {
    // Create dependencies if not provided
    const userId =
      overrides.userId || (await userTestFactory.buildAndInsertOne(db, {})).id;

    // Build and insert with dependencies
    const collection = this.buildOne({
      ...overrides,
      userId,
    });
    const result = await db.insert(collections).values(collection).returning();
    return result[0];
  },
};

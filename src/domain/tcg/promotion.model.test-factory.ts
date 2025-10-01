import { DB } from "@/src/infra/db/db";
import { promotions } from "@/src/infra/db/schema/tcg";
import { storesTestFactory } from "../auth/stores.model.test-factory";
import { Promotion } from "./promotion.model";

export const promotionTestFactory = {
  buildOne(overrides: Partial<Promotion>): Promotion {
    return {
      id: crypto.randomUUID(),
      storeId: crypto.randomUUID(),
      title: "Test Promotion",
      description: "A test promotion for testing purposes",
      discountPercentage: "10.00",
      startsAt: new Date(),
      endsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      collectionId: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    };
  },

  async insertOne(db: DB, overrides: Partial<Promotion>): Promise<Promotion> {
    const promotion = this.buildOne(overrides);
    const result = await db.insert(promotions).values(promotion).returning();
    return result[0];
  },

  async buildAndInsertOne(
    db: DB,
    overrides: Partial<Promotion>
  ): Promise<Promotion> {
    const promotion = this.buildOne(overrides);
    const result = await db.insert(promotions).values(promotion).returning();
    return result[0];
  },

  async buildAndInsertOneWithDependencies(
    db: DB,
    overrides: Partial<Promotion>
  ): Promise<Promotion> {
    // Create dependencies if not provided
    const storeId =
      overrides.storeId ||
      (await storesTestFactory.buildAndInsertOne(db, {})).id;

    // Optional dependencies
    const collectionId = overrides.collectionId;

    // Build and insert with dependencies
    const promotion = this.buildOne({
      ...overrides,
      storeId,
      collectionId,
    });
    const result = await db.insert(promotions).values(promotion).returning();
    return result[0];
  },
};

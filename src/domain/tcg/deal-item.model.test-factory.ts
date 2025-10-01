import { DB } from "@/src/infra/db/db";
import { dealItems } from "@/src/infra/db/schema/tcg";
import { collectionItemTestFactory } from "./collection-item.model.test-factory";
import { DealItem } from "./deal-item.model";
import { dealTestFactory } from "./deal.model.test-factory";

export const dealItemTestFactory = {
  buildOne(overrides: Partial<DealItem>): DealItem {
    return {
      id: crypto.randomUUID(),
      dealId: crypto.randomUUID(),
      collectionItemId: crypto.randomUUID(),
      agreedPrice: "50.00",
      quantity: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    };
  },

  async insertOne(db: DB, overrides: Partial<DealItem>): Promise<DealItem> {
    const item = this.buildOne(overrides);
    const result = await db.insert(dealItems).values(item).returning();
    return result[0];
  },

  async buildAndInsertOne(
    db: DB,
    overrides: Partial<DealItem>
  ): Promise<DealItem> {
    const item = this.buildOne(overrides);
    const result = await db.insert(dealItems).values(item).returning();
    return result[0];
  },

  async buildAndInsertOneWithDependencies(
    db: DB,
    overrides: Partial<DealItem>
  ): Promise<DealItem> {
    // Create dependencies if not provided
    const dealId =
      overrides.dealId || (await dealTestFactory.buildAndInsertOne(db, {})).id;
    const collectionItemId =
      overrides.collectionItemId ||
      (await collectionItemTestFactory.buildAndInsertOne(db, {})).id;

    // Build and insert with dependencies
    const item = this.buildOne({
      ...overrides,
      dealId,
      collectionItemId,
    });
    const result = await db.insert(dealItems).values(item).returning();
    return result[0];
  },
};

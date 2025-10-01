import { DB } from "@/src/infra/db/db";
import { collectionItems } from "@/src/infra/db/schema/tcg";
import { cardTestFactory } from "./card.model.test-factory";
import { CollectionItem } from "./collection-item.model";
import { collectionTestFactory } from "./collection.model.test-factory";

export const collectionItemTestFactory = {
  buildOne(overrides: Partial<CollectionItem>): CollectionItem {
    return {
      ...overrides,
      id: crypto.randomUUID(),
      collectionId: crypto.randomUUID(),
      cardScryfallId: crypto.randomUUID(),
      quantity: 1,
      condition: "NM",
      language: "en",
      isFoil: false,
      listingType: "sale",
      customPrice: "10.00",
      priceSource: "tcg",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  },

  async insertOne(
    db: DB,
    overrides: Partial<CollectionItem>
  ): Promise<CollectionItem> {
    const item = this.buildOne(overrides);
    const result = await db.insert(collectionItems).values(item).returning();
    return result[0];
  },

  async buildAndInsertOne(
    db: DB,
    overrides: Partial<CollectionItem>
  ): Promise<CollectionItem> {
    const item = this.buildOne(overrides);
    const result = await db.insert(collectionItems).values(item).returning();
    return result[0];
  },

  async buildAndInsertOneWithDependencies(
    db: DB,
    overrides: Partial<CollectionItem>
  ): Promise<CollectionItem> {
    // Create dependencies if not provided
    const collectionId =
      overrides.collectionId ||
      (await collectionTestFactory.buildAndInsertOne(db, {})).id;
    const cardScryfallId =
      overrides.cardScryfallId ||
      (await cardTestFactory.buildAndInsertOne(db, {})).scryfallId;

    // Build and insert with dependencies
    const item = this.buildOne({
      ...overrides,
      collectionId,
      cardScryfallId,
    });
    const result = await db.insert(collectionItems).values(item).returning();
    return result[0];
  },
};

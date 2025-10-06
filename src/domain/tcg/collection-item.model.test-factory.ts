import { DB } from "@/src/infra/db/db";
import { collectionItems } from "@/src/infra/db/schema/tcg";
import { cardTestFactory } from "./card.model.test-factory";
import { CollectionItem } from "./collection-item.model";
import { collectionTestFactory } from "./collection.model.test-factory";

export const collectionItemTestFactory = {
  buildOne(overrides: Partial<CollectionItem>): CollectionItem {
    return {
      id: crypto.randomUUID(),
      collectionId: crypto.randomUUID(),
      cardScryfallId: crypto.randomUUID(),
      quantity: 1,
      condition: "NM",
      language: "en",
      isFoil: false,
      listingType: "sale",
      customPrice: null,
      priceSource: "tcg",
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
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
    const collection =
      await collectionTestFactory.buildAndInsertOneWithDependencies(db, {
        ...(overrides.collectionId ? { id: overrides.collectionId } : {}),
      });
    const card = await cardTestFactory.buildAndInsertOne(db, {
      ...(overrides.cardScryfallId
        ? { scryfallId: overrides.cardScryfallId }
        : {}),
    });

    // Build and insert with dependencies
    const item = this.buildOne({
      ...overrides,
      collectionId: collection.id,
      cardScryfallId: card.scryfallId,
    });
    const result = await db.insert(collectionItems).values(item).returning();
    return result[0];
  },
};

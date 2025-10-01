import { DB } from "@/src/infra/db/db";
import { wantListItems } from "@/src/infra/db/schema/tcg";
import { cardTestFactory } from "./card.model.test-factory";
import { WantListItem } from "./want-list-item.model";
import { wantListTestFactory } from "./want-list.model.test-factory";

export const wantListItemTestFactory = {
  buildOne(overrides: Partial<WantListItem>): WantListItem {
    return {
      ...overrides,
      id: crypto.randomUUID(),
      wantListId: crypto.randomUUID(),
      cardScryfallId: crypto.randomUUID(),
      quantityWanted: 1,
      maxPrice: "15.00",
      conditionMinimum: "NM",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  },

  async insertOne(
    db: DB,
    overrides: Partial<WantListItem>
  ): Promise<WantListItem> {
    const item = this.buildOne(overrides);
    const result = await db.insert(wantListItems).values(item).returning();
    return result[0];
  },

  async buildAndInsertOne(
    db: DB,
    overrides: Partial<WantListItem>
  ): Promise<WantListItem> {
    const item = this.buildOne(overrides);
    const result = await db.insert(wantListItems).values(item).returning();
    return result[0];
  },

  async buildAndInsertOneWithDependencies(
    db: DB,
    overrides: Partial<WantListItem>
  ): Promise<WantListItem> {
    // Create dependencies if not provided
    const wantListId =
      overrides.wantListId ||
      (await wantListTestFactory.buildAndInsertOne(db, {})).id;
    const cardScryfallId =
      overrides.cardScryfallId ||
      (await cardTestFactory.buildAndInsertOne(db, {})).scryfallId;

    // Build and insert with dependencies
    const item = this.buildOne({
      ...overrides,
      wantListId,
      cardScryfallId,
    });
    const result = await db.insert(wantListItems).values(item).returning();
    return result[0];
  },
};

import { DB } from "@/src/infra/db/db";
import { wantListItems } from "@/src/infra/db/schema/tcg";
import { WantListItem } from "./want-list-item.model";

export function buildOne(overrides: Partial<WantListItem>): WantListItem {
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
}

export async function insertOne(
  db: DB,
  overrides: Partial<WantListItem>
): Promise<WantListItem> {
  const item = buildOne(overrides);
  const result = await db.insert(wantListItems).values(item).returning();
  return result[0];
}

export async function buildAndInsertOne(
  db: DB,
  overrides: Partial<WantListItem>
): Promise<WantListItem> {
  const item = buildOne(overrides);
  const result = await db.insert(wantListItems).values(item).returning();
  return result[0];
}

export async function buildAndInsertOneWithDependencies(
  db: DB,
  overrides: Partial<WantListItem>
): Promise<WantListItem> {
  // Import the required factories
  const { buildAndInsertOne: buildWantList } = await import(
    "./want-list.model.test-factory"
  );
  const { buildAndInsertOne: buildCard } = await import(
    "./card.model.test-factory"
  );

  // Create dependencies if not provided
  const wantListId = overrides.wantListId || (await buildWantList(db, {})).id;
  const cardScryfallId =
    overrides.cardScryfallId || (await buildCard(db, {})).scryfallId;

  // Build and insert with dependencies
  const item = buildOne({
    ...overrides,
    wantListId,
    cardScryfallId,
  });
  const result = await db.insert(wantListItems).values(item).returning();
  return result[0];
}

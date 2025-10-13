import { cardTestFactory } from "@/src/domain/tcg/card.model.test-factory";
import { InsertCollectionItem } from "@/src/domain/tcg/collection-item.model";
import { collectionTestFactory } from "@/src/domain/tcg/collection.model.test-factory";
import { buildRunWithTestDb, migrateTestDb } from "@/test-db";
import { randomUUID } from "crypto";
import { beforeAll, describe, expect, it } from "vitest";
import { DB } from "../../db/db";
import { createBulkCollectionItemsQuery } from "./create-bulk-collection-items.query";

describe("createBulkCollectionItemsQuery", () => {
  let runWithTestDb: Awaited<ReturnType<typeof buildRunWithTestDb>>;

  beforeAll(async () => {
    await migrateTestDb();
    runWithTestDb = await buildRunWithTestDb();
  });

  it("should create multiple collection items successfully", async () => {
    await runWithTestDb(async (testDb: DB) => {
      // Create the necessary dependencies
      const collection =
        await collectionTestFactory.buildAndInsertOneWithDependencies(testDb);
      const card1 = await cardTestFactory.buildAndInsertOne(testDb);
      const card2 = await cardTestFactory.buildAndInsertOne(testDb);

      const insertCollectionItems: InsertCollectionItem[] = [
        {
          id: randomUUID(),
          collectionId: collection.id,
          cardScryfallId: card1.scryfallId,
          quantity: 2,
          condition: "NM",
          language: "en",
          isFoil: false,
          listingType: "both",
          priceSource: "tcg",
        },
        {
          id: randomUUID(),
          collectionId: collection.id,
          cardScryfallId: card2.scryfallId,
          quantity: 1,
          condition: "LP",
          language: "en",
          isFoil: true,
          listingType: "trade",
          priceSource: "tcg",
        },
      ];

      const result = await createBulkCollectionItemsQuery(
        testDb,
        insertCollectionItems
      );

      expect(result.success).toBe(true);
      expect(result.collectionItems).toHaveLength(2);
      expect(result.collectionItems![0].quantity).toBe(2);
      expect(result.collectionItems![0].condition).toBe("NM");
      expect(result.collectionItems![0].isFoil).toBe(false);
      expect(result.collectionItems![1].quantity).toBe(1);
      expect(result.collectionItems![1].condition).toBe("LP");
      expect(result.collectionItems![1].isFoil).toBe(true);
    });
  });

  it("should handle empty array", async () => {
    await runWithTestDb(async (testDb: DB) => {
      const result = await createBulkCollectionItemsQuery(testDb, []);

      expect(result.success).toBe(true);
      expect(result.collectionItems).toHaveLength(0);
    });
  });

  it("should handle null/undefined input", async () => {
    await runWithTestDb(async (testDb: DB) => {
      const result = await createBulkCollectionItemsQuery(
        testDb,
        null as unknown as InsertCollectionItem[]
      );

      expect(result.success).toBe(true);
      expect(result.collectionItems).toHaveLength(0);
    });
  });

  it("should handle database errors gracefully", async () => {
    await runWithTestDb(async (testDb: DB) => {
      // Create invalid data that should cause a database error
      const invalidItems: InsertCollectionItem[] = [
        {
          id: randomUUID(),
          collectionId: "invalid-collection-id", // This should cause a foreign key constraint error
          cardScryfallId: "invalid-card-id", // This should cause a foreign key constraint error
          quantity: 1,
          condition: "NM",
          language: "en",
          isFoil: false,
          listingType: "both",
          priceSource: "tcg",
        },
      ];

      const result = await createBulkCollectionItemsQuery(testDb, invalidItems);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error).toContain("Database constraint violation");
    });
  });

  it("should validate required fields", async () => {
    await runWithTestDb(async (testDb: DB) => {
      const invalidItems: InsertCollectionItem[] = [
        {
          id: "", // Empty id should fail validation
          collectionId: randomUUID(),
          cardScryfallId: randomUUID(),
          quantity: 1,
          condition: "NM",
          language: "en",
          isFoil: false,
          listingType: "both",
          priceSource: "tcg",
        },
      ];

      const result = await createBulkCollectionItemsQuery(testDb, invalidItems);

      expect(result.success).toBe(false);
      expect(result.error).toContain("missing required fields");
    });
  });

  it("should create items with different quantities and conditions", async () => {
    await runWithTestDb(async (testDb: DB) => {
      // Create the necessary dependencies
      const collection =
        await collectionTestFactory.buildAndInsertOneWithDependencies(testDb);
      const card = await cardTestFactory.buildAndInsertOne(testDb);

      const insertCollectionItems: InsertCollectionItem[] = [
        {
          id: randomUUID(),
          collectionId: collection.id,
          cardScryfallId: card.scryfallId,
          quantity: 4,
          condition: "NM",
          language: "en",
          isFoil: false,
          listingType: "both",
          priceSource: "tcg",
        },
        {
          id: randomUUID(),
          collectionId: collection.id,
          cardScryfallId: card.scryfallId,
          quantity: 2,
          condition: "LP",
          language: "en",
          isFoil: true,
          listingType: "trade",
          priceSource: "tcg",
        },
        {
          id: randomUUID(),
          collectionId: collection.id,
          cardScryfallId: card.scryfallId,
          quantity: 1,
          condition: "MP",
          language: "en",
          isFoil: false,
          listingType: "sale",
          priceSource: "tcg",
        },
      ];

      const result = await createBulkCollectionItemsQuery(
        testDb,
        insertCollectionItems
      );

      expect(result.success).toBe(true);
      expect(result.collectionItems).toHaveLength(3);

      // Verify all items were created with correct data
      result.collectionItems!.forEach((item, index) => {
        expect(item.collectionId).toBe(collection.id);
        expect(item.cardScryfallId).toBe(card.scryfallId);
        expect(item.quantity).toBe(insertCollectionItems[index].quantity);
        expect(item.condition).toBe(insertCollectionItems[index].condition);
        expect(item.isFoil).toBe(insertCollectionItems[index].isFoil);
        expect(item.listingType).toBe(insertCollectionItems[index].listingType);
      });
    });
  });
});

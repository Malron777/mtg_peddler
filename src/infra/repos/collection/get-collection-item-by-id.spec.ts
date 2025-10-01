import { collectionItemTestFactory } from "@/src/domain/tcg/collection-item.model.test-factory";
import { buildRunWithTestDb, migrateTestDb } from "@/test-db";
import { beforeAll, describe, expect, it } from "vitest";
import { DB } from "../../db/db";
import { getCollectionItemByIdQuery } from "./get-collection-item-by-id.query";

describe("getCollectionItemByIdQuery", () => {
  let runWithTestDb: Awaited<ReturnType<typeof buildRunWithTestDb>>;

  beforeAll(async () => {
    await migrateTestDb();
    runWithTestDb = await buildRunWithTestDb();
  });

  it("should successfully retrieve a collection item by id", async () => {
    await runWithTestDb(async (db: DB) => {
      const collectionItem = await collectionItemTestFactory.buildAndInsertOne(
        db,
        {
          collectionId: "test-collection-id-1",
          cardScryfallId: "test-card-scryfall-id-1",
          quantity: 2,
          isFoil: false,
          condition: "NM",
        }
      );

      const result = await getCollectionItemByIdQuery(db, collectionItem.id);

      expect(result.success).toBe(true);
      expect(result.collectionItem).toBeDefined();
      expect(result.collectionItem?.id).toBe(collectionItem.id);
      expect(result.collectionItem?.collectionId).toBe("test-collection-id-1");
      expect(result.collectionItem?.cardScryfallId).toBe(
        "test-card-scryfall-id-1"
      );
      expect(result.collectionItem?.quantity).toBe(2);
      expect(result.collectionItem?.isFoil).toBe(false);
      expect(result.collectionItem?.condition).toBe("NM");
      expect(result.error).toBeUndefined();
    });
  });

  it("should return error when collection item is not found", async () => {
    await runWithTestDb(async (db: DB) => {
      const nonExistentId = "non-existent-collection-item-id";

      const result = await getCollectionItemByIdQuery(db, nonExistentId);

      expect(result.success).toBe(false);
      expect(result.collectionItem).toBeUndefined();
      expect(result.error).toBe("Collection item not found");
    });
  });

  it("should handle empty id", async () => {
    await runWithTestDb(async (db: DB) => {
      const result = await getCollectionItemByIdQuery(db, "");

      expect(result.success).toBe(false);
      expect(result.collectionItem).toBeUndefined();
      expect(result.error).toBe("Collection item not found");
    });
  });

  it("should handle null id", async () => {
    await runWithTestDb(async (db: DB) => {
      const result = await getCollectionItemByIdQuery(
        db,
        null as unknown as string
      );

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  it("should handle malformed id", async () => {
    await runWithTestDb(async (db: DB) => {
      const malformedId = "malformed-id-with-special-chars!@#$%";

      const result = await getCollectionItemByIdQuery(db, malformedId);

      expect(result.success).toBe(false);
      expect(result.collectionItem).toBeUndefined();
      expect(result.error).toBe("Collection item not found");
    });
  });

  it("should retrieve a foil collection item", async () => {
    await runWithTestDb(async (db: DB) => {
      const collectionItem = await collectionItemTestFactory.buildAndInsertOne(
        db,
        {
          collectionId: "test-collection-id-1",
          cardScryfallId: "test-card-scryfall-id-1",
          quantity: 1,
          isFoil: true,
          condition: "LP",
        }
      );

      const result = await getCollectionItemByIdQuery(db, collectionItem.id);

      expect(result.success).toBe(true);
      expect(result.collectionItem).toBeDefined();
      expect(result.collectionItem?.isFoil).toBe(true);
      expect(result.collectionItem?.condition).toBe("LP");
      expect(result.error).toBeUndefined();
    });
  });
});

import { wantListItemTestFactory } from "@/src/domain/tcg/want-list-item.model.test-factory";
import { buildRunWithTestDb, migrateTestDb } from "@/test-db";
import { beforeAll, describe, expect, it } from "vitest";
import { DB } from "../../db/db";
import { getWantListItemQuery } from "./get-want-list-item.query";

describe("getWantListItemQuery", () => {
  let runWithTestDb: Awaited<ReturnType<typeof buildRunWithTestDb>>;

  beforeAll(async () => {
    await migrateTestDb();
    runWithTestDb = await buildRunWithTestDb();
  });

  it("should successfully retrieve a want list item", async () => {
    await runWithTestDb(async (db: DB) => {
      const wantListItem = await wantListItemTestFactory.buildAndInsertOne(db, {
        wantListId: "test-want-list-id-1",
        cardScryfallId: "test-card-scryfall-id-1",
        quantityWanted: 2,
        maxPrice: "25.00",
        conditionMinimum: "NM",
      });

      const result = await getWantListItemQuery(db, wantListItem.id);

      expect(result.success).toBe(true);
      expect(result.wantListItem).toBeDefined();
      expect(result.wantListItem?.id).toBe(wantListItem.id);
      expect(result.wantListItem?.wantListId).toBe("test-want-list-id-1");
      expect(result.wantListItem?.cardScryfallId).toBe(
        "test-card-scryfall-id-1"
      );
      expect(result.wantListItem?.quantityWanted).toBe(2);
      expect(result.wantListItem?.maxPrice).toBe("25.00");
      expect(result.wantListItem?.conditionMinimum).toBe("NM");
      expect(result.error).toBeUndefined();
    });
  });

  it("should return error when want list item is not found", async () => {
    await runWithTestDb(async (db: DB) => {
      const nonExistentId = "non-existent-want-list-item-id";

      const result = await getWantListItemQuery(db, nonExistentId);

      expect(result.success).toBe(false);
      expect(result.wantListItem).toBeUndefined();
      expect(result.error).toBe("Want list item not found");
    });
  });

  it("should handle empty id", async () => {
    await runWithTestDb(async (db: DB) => {
      const result = await getWantListItemQuery(db, "");

      expect(result.success).toBe(false);
      expect(result.wantListItem).toBeUndefined();
      expect(result.error).toBe("Want list item not found");
    });
  });

  it("should handle null id", async () => {
    await runWithTestDb(async (db: DB) => {
      const result = await getWantListItemQuery(db, null as unknown as string);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  it("should handle malformed id", async () => {
    await runWithTestDb(async (db: DB) => {
      const malformedId = "malformed-id-with-special-chars!@#$%";

      const result = await getWantListItemQuery(db, malformedId);

      expect(result.success).toBe(false);
      expect(result.wantListItem).toBeUndefined();
      expect(result.error).toBe("Want list item not found");
    });
  });

  it("should retrieve a want list item with high quantity", async () => {
    await runWithTestDb(async (db: DB) => {
      const wantListItem = await wantListItemTestFactory.buildAndInsertOne(db, {
        wantListId: "test-want-list-id-1",
        cardScryfallId: "test-card-scryfall-id-1",
        quantityWanted: 10,
        maxPrice: "100.00",
      });

      const result = await getWantListItemQuery(db, wantListItem.id);

      expect(result.success).toBe(true);
      expect(result.wantListItem).toBeDefined();
      expect(result.wantListItem?.quantityWanted).toBe(10);
      expect(result.wantListItem?.maxPrice).toBe("100.00");
      expect(result.error).toBeUndefined();
    });
  });
});

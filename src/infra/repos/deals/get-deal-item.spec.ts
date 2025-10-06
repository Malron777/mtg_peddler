import { dealItemTestFactory } from "@/src/domain/tcg/deal-item.model.test-factory";
import { buildRunWithTestDb, migrateTestDb } from "@/test-db";
import { beforeAll, describe, expect, it } from "vitest";
import { DB } from "../../db/db";
import { getDealItemQuery } from "./get-deal-item.query";

describe("getDealItemQuery", () => {
  let runWithTestDb: Awaited<ReturnType<typeof buildRunWithTestDb>>;

  beforeAll(async () => {
    await migrateTestDb();
    runWithTestDb = await buildRunWithTestDb();
  });

  it("should successfully retrieve a deal item", async () => {
    await runWithTestDb(async (db: DB) => {
      const dealItem =
        await dealItemTestFactory.buildAndInsertOneWithDependencies(db, {
          dealId: "test-deal-id-1",
          collectionItemId: "test-collection-item-id-1",
          agreedPrice: "25.00",
          quantity: 2,
        });

      const result = await getDealItemQuery(db, dealItem.id);

      expect(result.success).toBe(true);
      expect(result.dealItem).toBeDefined();
      expect(result.dealItem?.id).toBe(dealItem.id);
      expect(result.dealItem?.dealId).toBe("test-deal-id-1");
      expect(result.dealItem?.collectionItemId).toBe(
        "test-collection-item-id-1"
      );
      expect(result.dealItem?.agreedPrice).toBe("25.00");
      expect(result.dealItem?.quantity).toBe(2);
      expect(result.error).toBeUndefined();
    });
  });

  it("should return error when deal item is not found", async () => {
    await runWithTestDb(async (db: DB) => {
      const nonExistentId = "non-existent-deal-item-id";

      const result = await getDealItemQuery(db, nonExistentId);

      expect(result.success).toBe(false);
      expect(result.dealItem).toBeUndefined();
      expect(result.error).toBe("Deal item not found");
    });
  });

  it("should handle empty id", async () => {
    await runWithTestDb(async (db: DB) => {
      const result = await getDealItemQuery(db, "");

      expect(result.success).toBe(false);
      expect(result.dealItem).toBeUndefined();
      expect(result.error).toBe("Deal item not found");
    });
  });

  it("should handle null id", async () => {
    await runWithTestDb(async (db: DB) => {
      const result = await getDealItemQuery(db, null as unknown as string);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  it("should handle malformed id", async () => {
    await runWithTestDb(async (db: DB) => {
      const malformedId = "malformed-id-with-special-chars!@#$%";

      const result = await getDealItemQuery(db, malformedId);

      expect(result.success).toBe(false);
      expect(result.dealItem).toBeUndefined();
      expect(result.error).toBe("Deal item not found");
    });
  });

  it("should retrieve a deal item with high quantity", async () => {
    await runWithTestDb(async (db: DB) => {
      const dealItem =
        await dealItemTestFactory.buildAndInsertOneWithDependencies(db, {
          dealId: "test-deal-id-1",
          collectionItemId: "test-collection-item-id-1",
          agreedPrice: "100.00",
          quantity: 10,
        });

      const result = await getDealItemQuery(db, dealItem.id);

      expect(result.success).toBe(true);
      expect(result.dealItem).toBeDefined();
      expect(result.dealItem?.quantity).toBe(10);
      expect(result.dealItem?.agreedPrice).toBe("100.00");
      expect(result.error).toBeUndefined();
    });
  });
});

import { dealItemTestFactory } from "@/src/domain/tcg/deal-item.model.test-factory";
import { buildRunWithTestDb, migrateTestDb } from "@/test-db";
import { beforeAll, describe, expect, it } from "vitest";
import { DB } from "../../db/db";
import { updateDealItemQuery } from "./update-deal-item.query";

describe("updateDealItemQuery", () => {
  let runWithTestDb: Awaited<ReturnType<typeof buildRunWithTestDb>>;

  beforeAll(async () => {
    await migrateTestDb();
    runWithTestDb = await buildRunWithTestDb();
  });

  it("should successfully update a deal item", async () => {
    await runWithTestDb(async (db: DB) => {
      const dealItem =
        await dealItemTestFactory.buildAndInsertOneWithDependencies(db, {
          dealId: "test-deal-id-1",
          collectionItemId: "test-collection-item-id-1",
          agreedPrice: "10.00",
          quantity: 1,
        });

      const updateData = {
        id: dealItem.id,
        agreedPrice: "25.00",
        quantity: 3,
      };

      const result = await updateDealItemQuery(db, updateData);

      expect(result.id).toBe(dealItem.id);
      expect(result.agreedPrice).toBe("25.00");
      expect(result.quantity).toBe(3);
      expect(result.updatedAt).toBeDefined();
    });
  });

  it("should return undefined when updating non-existent deal item", async () => {
    await runWithTestDb(async (db: DB) => {
      const updateData = {
        id: "non-existent-deal-item-id",
        agreedPrice: "25.00",
      };

      const result = await updateDealItemQuery(db, updateData);
      expect(result).toBeUndefined();
    });
  });

  it("should handle partial updates", async () => {
    await runWithTestDb(async (db: DB) => {
      const dealItem =
        await dealItemTestFactory.buildAndInsertOneWithDependencies(db, {
          dealId: "test-deal-id-1",
          collectionItemId: "test-collection-item-id-1",
          agreedPrice: "10.00",
          quantity: 1,
        });

      const updateData = {
        id: dealItem.id,
        agreedPrice: "30.00",
      };

      const result = await updateDealItemQuery(db, updateData);

      expect(result.id).toBe(dealItem.id);
      expect(result.agreedPrice).toBe("30.00");
      expect(result.quantity).toBe(1);
    });
  });

  it("should handle empty update data", async () => {
    await runWithTestDb(async (db: DB) => {
      const dealItem =
        await dealItemTestFactory.buildAndInsertOneWithDependencies(db, {
          dealId: "test-deal-id-1",
          collectionItemId: "test-collection-item-id-1",
          agreedPrice: "10.00",
          quantity: 1,
        });

      const updateData = {
        id: dealItem.id,
      };

      const result = await updateDealItemQuery(db, updateData);

      expect(result.id).toBe(dealItem.id);
      expect(result.agreedPrice).toBe("10.00");
      expect(result.quantity).toBe(1);
      expect(result.updatedAt).toBeDefined();
    });
  });

  it("should throw error with invalid update data", async () => {
    await runWithTestDb(async (db: DB) => {
      const dealItem =
        await dealItemTestFactory.buildAndInsertOneWithDependencies(db, {
          dealId: "test-deal-id-1",
          collectionItemId: "test-collection-item-id-1",
          agreedPrice: "10.00",
          quantity: 1,
        });

      const updateData = {
        id: dealItem.id,
        dealId: null as unknown as string,
        quantity: -1,
      };

      await expect(updateDealItemQuery(db, updateData)).rejects.toThrow();
    });
  });
});

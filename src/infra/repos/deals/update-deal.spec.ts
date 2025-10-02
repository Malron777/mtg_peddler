import { dealTestFactory } from "@/src/domain/tcg/deal.model.test-factory";
import { buildRunWithTestDb, migrateTestDb } from "@/test-db";
import { beforeAll, describe, expect, it } from "vitest";
import { DB } from "../../db/db";
import { updateDealQuery } from "./update-deal.query";

describe("updateDealQuery", () => {
  let runWithTestDb: Awaited<ReturnType<typeof buildRunWithTestDb>>;

  beforeAll(async () => {
    await migrateTestDb();
    runWithTestDb = await buildRunWithTestDb();
  });

  it("should successfully update an existing deal", async () => {
    await runWithTestDb(async (db: DB) => {
      const deal = await dealTestFactory.buildAndInsertOneWithDependencies(db, {
        status: "negotiating",
        totalAmount: "100.00",
      });

      const updateData = {
        id: deal.id,
        status: "completed" as const,
        totalAmount: "120.00",
        finalizedAt: new Date("2023-01-01"),
      };

      const result = await updateDealQuery(db, updateData);

      expect(result.id).toBe(deal.id);
      expect(result.status).toBe("completed");
      expect(result.totalAmount).toBe("120.00");
      expect(result.finalizedAt).toBeDefined();
      expect(result.sellerId).toBe(deal.sellerId); // Should remain unchanged
      expect(result.buyerId).toBe(deal.buyerId); // Should remain unchanged
      expect(result.updatedAt).toBeDefined();
      expect(result.updatedAt.getTime()).toBeGreaterThan(
        deal.updatedAt.getTime()
      );
    });
  });

  it("should return undefined when trying to update non-existent deal", async () => {
    await runWithTestDb(async (db: DB) => {
      const updateData = {
        id: "non-existent-deal-id",
        status: "completed" as const,
        totalAmount: "120.00",
      };

      const result = await updateDealQuery(db, updateData);

      expect(result).toBeUndefined();
    });
  });

  it("should handle partial updates correctly", async () => {
    await runWithTestDb(async (db: DB) => {
      const deal = await dealTestFactory.buildAndInsertOneWithDependencies(db, {
        status: "negotiating",
        totalAmount: "200.00",
      });

      const updateData = {
        id: deal.id,
        status: "completed" as const,
      };

      const result = await updateDealQuery(db, updateData);

      expect(result.id).toBe(deal.id);
      expect(result.status).toBe("completed");
      expect(result.totalAmount).toBe(deal.totalAmount); // Should remain unchanged
      expect(result.sellerId).toBe(deal.sellerId); // Should remain unchanged
      expect(result.buyerId).toBe(deal.buyerId); // Should remain unchanged
      expect(result.updatedAt).toBeDefined();
    });
  });

  it("should handle empty update data gracefully", async () => {
    await runWithTestDb(async (db: DB) => {
      const deal = await dealTestFactory.buildAndInsertOneWithDependencies(db, {
        status: "negotiating",
        totalAmount: "300.00",
      });

      const updateData = {
        id: deal.id,
      };

      const result = await updateDealQuery(db, updateData);

      expect(result.id).toBe(deal.id);
      expect(result.status).toBe(deal.status); // Should remain unchanged
      expect(result.totalAmount).toBe(deal.totalAmount); // Should remain unchanged
      expect(result.sellerId).toBe(deal.sellerId); // Should remain unchanged
      expect(result.buyerId).toBe(deal.buyerId); // Should remain unchanged
      expect(result.updatedAt).toBeDefined();
    });
  });

  it("should handle invalid update data", async () => {
    await runWithTestDb(async (db: DB) => {
      const deal = await dealTestFactory.buildAndInsertOneWithDependencies(db, {
        status: "negotiating",
        totalAmount: "400.00",
      });

      const updateData = {
        id: deal.id,
        status: "completed" as const,
        totalAmount: "invalid-amount", // Invalid amount format
      };

      await expect(updateDealQuery(db, updateData)).rejects.toThrow();
    });
  });
});

import { dealTestFactory } from "@/src/domain/tcg/deal.model.test-factory";
import { buildRunWithTestDb, migrateTestDb } from "@/test-db";
import { beforeAll, describe, expect, it } from "vitest";
import { DB } from "../../db/db";
import { getDealQuery } from "./get-deal.query";

describe("getDealQuery", () => {
  let runWithTestDb: Awaited<ReturnType<typeof buildRunWithTestDb>>;

  beforeAll(async () => {
    await migrateTestDb();
    runWithTestDb = await buildRunWithTestDb();
  });

  it("should successfully retrieve an existing deal", async () => {
    await runWithTestDb(async (db: DB) => {
      const deal = await dealTestFactory.insertOne(db, {
        id: "test-deal-id-1",
        sellerId: "test-seller-id-1",
        buyerId: "test-buyer-id-1",
        status: "negotiating",
        totalAmount: "100.00",
        paymentMethodId: "test-payment-method-id-1",
        shippingLocationId: "test-location-id-1",
      });

      const result = await getDealQuery(db, deal.id);

      expect(result.success).toBe(true);
      expect(result.deal).toBeDefined();
      expect(result.deal?.id).toBe(deal.id);
      expect(result.deal?.sellerId).toBe("test-seller-id-1");
      expect(result.deal?.buyerId).toBe("test-buyer-id-1");
      expect(result.deal?.status).toBe("negotiating");
      expect(result.deal?.totalAmount).toBe("100.00");
      expect(result.error).toBeUndefined();
    });
  });

  it("should return error when deal is not found", async () => {
    await runWithTestDb(async (db: DB) => {
      const nonExistentId = "non-existent-deal-id";

      const result = await getDealQuery(db, nonExistentId);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Deal not found");
      expect(result.deal).toBeUndefined();
    });
  });

  it("should handle empty id gracefully", async () => {
    await runWithTestDb(async (db: DB) => {
      const result = await getDealQuery(db, "");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Deal not found");
      expect(result.deal).toBeUndefined();
    });
  });

  it("should handle null id gracefully", async () => {
    await runWithTestDb(async (db: DB) => {
      const result = await getDealQuery(db, null as unknown as string);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.deal).toBeUndefined();
    });
  });

  it("should handle malformed id gracefully", async () => {
    await runWithTestDb(async (db: DB) => {
      const malformedId = "malformed-id-with-special-chars-!@#$%";

      const result = await getDealQuery(db, malformedId);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Deal not found");
      expect(result.deal).toBeUndefined();
    });
  });

  it("should retrieve a finalized deal", async () => {
    await runWithTestDb(async (db: DB) => {
      const deal = await dealTestFactory.insertOne(db, {
        id: "test-finalized-deal-id",
        sellerId: "test-seller-id-2",
        buyerId: "test-buyer-id-2",
        status: "completed",
        totalAmount: "250.00",
        paymentMethodId: "test-payment-method-id-2",
        shippingLocationId: "test-location-id-2",
        finalizedAt: new Date("2023-01-01"),
      });

      const result = await getDealQuery(db, deal.id);

      expect(result.success).toBe(true);
      expect(result.deal).toBeDefined();
      expect(result.deal?.status).toBe("completed");
      expect(result.deal?.finalizedAt).toBeDefined();
      expect(result.error).toBeUndefined();
    });
  });
});

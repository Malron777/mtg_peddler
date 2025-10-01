import { userTestFactory } from "@/src/domain/auth/user.model.test-factory";
import { dealTestFactory } from "@/src/domain/tcg/deal.model.test-factory";
import { locationTestFactory } from "@/src/domain/tcg/location.model.test-factory";
import { paymentMethodTestFactory } from "@/src/domain/tcg/payment-method.model.test-factory";
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
      // Create dependencies first
      const seller = await userTestFactory.buildAndInsertOne(db, {
        id: "test-seller-id-1",
        name: "Test Seller",
        email: "seller@example.com",
      });

      const buyer = await userTestFactory.buildAndInsertOne(db, {
        id: "test-buyer-id-1",
        name: "Test Buyer",
        email: "buyer@example.com",
      });

      const paymentMethod =
        await paymentMethodTestFactory.buildAndInsertOneWithDependencies(db, {
          id: "test-payment-method-id-1",
          userId: buyer.id,
          type: "bank_transfer",
          details: { accountNumber: "123456789", bankName: "Test Bank" },
        });

      const location =
        await locationTestFactory.buildAndInsertOneWithDependencies(db, {
          id: "test-location-id-1",
          userId: seller.id,
          type: "address",
          name: "Test Location",
          addressDetails: { street: "123 Test St", city: "Test City" },
        });

      const deal = await dealTestFactory.insertOne(db, {
        id: "test-deal-id-1",
        sellerId: seller.id,
        buyerId: buyer.id,
        status: "negotiating",
        totalAmount: "100.00",
        paymentMethodId: paymentMethod.id,
        shippingLocationId: location.id,
      });

      const result = await getDealQuery(db, deal.id);

      expect(result.success).toBe(true);
      expect(result.deal).toBeDefined();
      expect(result.deal?.id).toBe(deal.id);
      expect(result.deal?.sellerId).toBe(seller.id);
      expect(result.deal?.buyerId).toBe(buyer.id);
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
      // Create dependencies first
      const seller = await userTestFactory.buildAndInsertOne(db, {
        id: "test-seller-id-2",
        name: "Test Seller 2",
        email: "seller2@example.com",
      });

      const buyer = await userTestFactory.buildAndInsertOne(db, {
        id: "test-buyer-id-2",
        name: "Test Buyer 2",
        email: "buyer2@example.com",
      });

      const paymentMethod =
        await paymentMethodTestFactory.buildAndInsertOneWithDependencies(db, {
          id: "test-payment-method-id-2",
          userId: buyer.id,
          type: "cash",
          details: { amount: "250.00", currency: "USD" },
        });

      const location =
        await locationTestFactory.buildAndInsertOneWithDependencies(db, {
          id: "test-location-id-2",
          userId: seller.id,
          type: "address",
          name: "Test Location 2",
          addressDetails: { street: "456 Test Ave", city: "Test City" },
        });

      const deal = await dealTestFactory.insertOne(db, {
        id: "test-finalized-deal-id",
        sellerId: seller.id,
        buyerId: buyer.id,
        status: "completed",
        totalAmount: "250.00",
        paymentMethodId: paymentMethod.id,
        shippingLocationId: location.id,
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

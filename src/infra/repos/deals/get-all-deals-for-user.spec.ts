import { dealTestFactory } from "@/src/domain/tcg/deal.model.test-factory";
import { buildRunWithTestDb, migrateTestDb } from "@/test-db";
import { beforeAll, describe, expect, it } from "vitest";
import { DB } from "../../db/db";
import { getAllDealsForUserQuery } from "./get-all-deals-for-user.query";

describe("getAllDealsForUserQuery", () => {
  let runWithTestDb: Awaited<ReturnType<typeof buildRunWithTestDb>>;

  beforeAll(async () => {
    await migrateTestDb();
    runWithTestDb = await buildRunWithTestDb();
  });

  it("should return all deals for a specific user (as seller and buyer)", async () => {
    await runWithTestDb(async (db: DB) => {
      const userId = "test-user-id-1";

      // Create deals where user is seller
      const deal1 = await dealTestFactory.insertOne(db, {
        id: "test-deal-id-1",
        sellerId: userId,
        buyerId: "test-buyer-id-1",
        status: "negotiating",
        totalAmount: "100.00",
        paymentMethodId: "test-payment-method-id-1",
        shippingLocationId: "test-location-id-1",
      });

      // Create deals where user is buyer
      const deal2 = await dealTestFactory.insertOne(db, {
        id: "test-deal-id-2",
        sellerId: "test-seller-id-1",
        buyerId: userId,
        status: "completed",
        totalAmount: "250.00",
        paymentMethodId: "test-payment-method-id-2",
        shippingLocationId: "test-location-id-2",
        finalizedAt: new Date("2023-01-01"),
      });

      // Create a deal for a different user
      await dealTestFactory.insertOne(db, {
        id: "test-deal-id-3",
        sellerId: "test-seller-id-2",
        buyerId: "test-buyer-id-2",
        status: "negotiating",
        totalAmount: "300.00",
        paymentMethodId: "test-payment-method-id-3",
        shippingLocationId: "test-location-id-3",
      });

      const result = await getAllDealsForUserQuery(db, userId);

      expect(result.deals).toHaveLength(2);
      expect(result.totalCount).toBe(2);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(50);
      expect(result.totalPages).toBe(1);
      expect(result.deals.some((d) => d.id === deal1.id)).toBe(true);
      expect(result.deals.some((d) => d.id === deal2.id)).toBe(true);
      expect(
        result.deals.every((d) => d.sellerId === userId || d.buyerId === userId)
      ).toBe(true);
    });
  });

  it("should return empty result when user has no deals", async () => {
    await runWithTestDb(async (db: DB) => {
      const userId = "user-with-no-deals";

      const result = await getAllDealsForUserQuery(db, userId);

      expect(result.deals).toHaveLength(0);
      expect(result.totalCount).toBe(0);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(50);
      expect(result.totalPages).toBe(0);
    });
  });

  it("should return empty result for non-existent user", async () => {
    await runWithTestDb(async (db: DB) => {
      const result = await getAllDealsForUserQuery(db, "non-existent-user-id");

      expect(result.deals).toHaveLength(0);
      expect(result.totalCount).toBe(0);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(50);
      expect(result.totalPages).toBe(0);
    });
  });

  it("should handle custom pagination options", async () => {
    await runWithTestDb(async (db: DB) => {
      const userId = "test-user-id-pagination";

      // Create multiple deals for the user
      for (let i = 1; i <= 5; i++) {
        await dealTestFactory.insertOne(db, {
          id: `test-deal-id-${i}`,
          sellerId: i % 2 === 0 ? userId : `test-seller-id-${i}`,
          buyerId: i % 2 === 0 ? `test-buyer-id-${i}` : userId,
          status: i % 2 === 0 ? "completed" : "negotiating",
          totalAmount: `${100 + i * 10}.00`,
          paymentMethodId: `test-payment-method-id-${i}`,
          shippingLocationId: `test-location-id-${i}`,
        });
      }

      const result = await getAllDealsForUserQuery(db, userId, {
        page: 2,
        pageSize: 2,
      });

      expect(result.deals).toHaveLength(2);
      expect(result.totalCount).toBe(5);
      expect(result.page).toBe(2);
      expect(result.pageSize).toBe(2);
      expect(result.totalPages).toBe(3);
    });
  });

  it("should order deals by createdAt descending", async () => {
    await runWithTestDb(async (db: DB) => {
      const userId = "test-user-id-ordering";

      const deal1 = await dealTestFactory.insertOne(db, {
        id: "test-deal-id-1",
        sellerId: userId,
        buyerId: "test-buyer-id-1",
        status: "negotiating",
        totalAmount: "100.00",
        paymentMethodId: "test-payment-method-id-1",
        shippingLocationId: "test-location-id-1",
        createdAt: new Date("2023-01-01"),
      });

      const deal2 = await dealTestFactory.insertOne(db, {
        id: "test-deal-id-2",
        sellerId: "test-seller-id-1",
        buyerId: userId,
        status: "completed",
        totalAmount: "250.00",
        paymentMethodId: "test-payment-method-id-2",
        shippingLocationId: "test-location-id-2",
        createdAt: new Date("2023-01-02"),
      });

      const result = await getAllDealsForUserQuery(db, userId);

      expect(result.deals).toHaveLength(2);
      expect(result.deals[0].id).toBe(deal2.id); // Most recent first
      expect(result.deals[1].id).toBe(deal1.id);
    });
  });

  it("should handle empty userId gracefully", async () => {
    await runWithTestDb(async (db: DB) => {
      const result = await getAllDealsForUserQuery(db, "");

      expect(result.deals).toHaveLength(0);
      expect(result.totalCount).toBe(0);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(50);
      expect(result.totalPages).toBe(0);
    });
  });
});

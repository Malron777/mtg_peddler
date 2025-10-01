import { dealTestFactory } from "@/src/domain/tcg/deal.model.test-factory";
import { buildRunWithTestDb, migrateTestDb } from "@/test-db";
import { beforeAll, describe, expect, it } from "vitest";
import { DB } from "../../db/db";
import { getAllDealsQuery } from "./get-all-deals.query";

describe("getAllDealsQuery", () => {
  let runWithTestDb: Awaited<ReturnType<typeof buildRunWithTestDb>>;

  beforeAll(async () => {
    await migrateTestDb();
    runWithTestDb = await buildRunWithTestDb();
  });

  it("should return all deals with default pagination", async () => {
    await runWithTestDb(async (db: DB) => {
      // Insert test deals
      const deal1 = await dealTestFactory.insertOne(db, {
        id: "test-deal-id-1",
        sellerId: "test-seller-id-1",
        buyerId: "test-buyer-id-1",
        status: "negotiating",
        totalAmount: "100.00",
        paymentMethodId: "test-payment-method-id-1",
        shippingLocationId: "test-location-id-1",
      });

      const deal2 = await dealTestFactory.insertOne(db, {
        id: "test-deal-id-2",
        sellerId: "test-seller-id-2",
        buyerId: "test-buyer-id-2",
        status: "completed",
        totalAmount: "250.00",
        paymentMethodId: "test-payment-method-id-2",
        shippingLocationId: "test-location-id-2",
        finalizedAt: new Date("2023-01-01"),
      });

      const result = await getAllDealsQuery(db);

      expect(result.deals).toHaveLength(2);
      expect(result.totalCount).toBe(2);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(50);
      expect(result.totalPages).toBe(1);
      expect(result.deals.some((d) => d.id === deal1.id)).toBe(true);
      expect(result.deals.some((d) => d.id === deal2.id)).toBe(true);
    });
  });

  it("should return empty result when no deals exist", async () => {
    await runWithTestDb(async (db: DB) => {
      const result = await getAllDealsQuery(db);

      expect(result.deals).toHaveLength(0);
      expect(result.totalCount).toBe(0);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(50);
      expect(result.totalPages).toBe(0);
    });
  });

  it("should handle custom pagination options", async () => {
    await runWithTestDb(async (db: DB) => {
      // Insert multiple deals
      for (let i = 1; i <= 5; i++) {
        await dealTestFactory.insertOne(db, {
          id: `test-deal-id-${i}`,
          sellerId: `test-seller-id-${i}`,
          buyerId: `test-buyer-id-${i}`,
          status: i % 2 === 0 ? "completed" : "negotiating",
          totalAmount: `${100 + i * 10}.00`,
          paymentMethodId: `test-payment-method-id-${i}`,
          shippingLocationId: `test-location-id-${i}`,
        });
      }

      const result = await getAllDealsQuery(db, { page: 2, pageSize: 2 });

      expect(result.deals).toHaveLength(2);
      expect(result.totalCount).toBe(5);
      expect(result.page).toBe(2);
      expect(result.pageSize).toBe(2);
      expect(result.totalPages).toBe(3);
    });
  });

  it("should handle invalid pagination options gracefully", async () => {
    await runWithTestDb(async (db: DB) => {
      await dealTestFactory.insertOne(db, {
        id: "test-deal-id-1",
        sellerId: "test-seller-id-1",
        buyerId: "test-buyer-id-1",
        status: "negotiating",
        totalAmount: "100.00",
        paymentMethodId: "test-payment-method-id-1",
        shippingLocationId: "test-location-id-1",
      });

      const result = await getAllDealsQuery(db, { page: 0, pageSize: -1 });

      expect(result.deals).toHaveLength(1);
      expect(result.totalCount).toBe(1);
      expect(result.page).toBe(0);
      expect(result.pageSize).toBe(-1);
      expect(result.totalPages).toBe(-1);
    });
  });

  it("should order deals by createdAt descending", async () => {
    await runWithTestDb(async (db: DB) => {
      const deal1 = await dealTestFactory.insertOne(db, {
        id: "test-deal-id-1",
        sellerId: "test-seller-id-1",
        buyerId: "test-buyer-id-1",
        status: "negotiating",
        totalAmount: "100.00",
        paymentMethodId: "test-payment-method-id-1",
        shippingLocationId: "test-location-id-1",
        createdAt: new Date("2023-01-01"),
      });

      // Wait a bit to ensure different timestamps
      await new Promise((resolve) => setTimeout(resolve, 10));

      const deal2 = await dealTestFactory.insertOne(db, {
        id: "test-deal-id-2",
        sellerId: "test-seller-id-2",
        buyerId: "test-buyer-id-2",
        status: "completed",
        totalAmount: "250.00",
        paymentMethodId: "test-payment-method-id-2",
        shippingLocationId: "test-location-id-2",
        createdAt: new Date("2023-01-02"),
      });

      const result = await getAllDealsQuery(db);

      expect(result.deals).toHaveLength(2);
      expect(result.deals[0].id).toBe(deal2.id); // Most recent first
      expect(result.deals[1].id).toBe(deal1.id);
    });
  });

  it("should handle large page sizes gracefully", async () => {
    await runWithTestDb(async (db: DB) => {
      // Create a few deals
      for (let i = 1; i <= 3; i++) {
        await dealTestFactory.insertOne(db, {
          id: `test-deal-id-${i}`,
          sellerId: `test-seller-id-${i}`,
          buyerId: `test-buyer-id-${i}`,
          status: "negotiating",
          totalAmount: `${100 + i * 10}.00`,
          paymentMethodId: `test-payment-method-id-${i}`,
          shippingLocationId: `test-location-id-${i}`,
        });
      }

      const result = await getAllDealsQuery(db, { page: 1, pageSize: 1000 });

      expect(result.deals).toHaveLength(3);
      expect(result.totalCount).toBe(3);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(1000);
      expect(result.totalPages).toBe(1);
    });
  });
});

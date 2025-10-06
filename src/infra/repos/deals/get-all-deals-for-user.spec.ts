import { userTestFactory } from "@/src/domain/auth/user.model.test-factory";
import { dealTestFactory } from "@/src/domain/tcg/deal.model.test-factory";
import { locationTestFactory } from "@/src/domain/tcg/location.model.test-factory";
import { paymentMethodTestFactory } from "@/src/domain/tcg/payment-method.model.test-factory";
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
      // Create dependencies first
      const user = await userTestFactory.buildAndInsertOne(db, {
        id: "test-user-id-1",
        name: "Test User 1",
        email: "test1@example.com",
      });

      const buyer1 = await userTestFactory.buildAndInsertOne(db, {
        id: "test-buyer-id-1",
        name: "Test Buyer 1",
        email: "buyer1@example.com",
      });

      const seller1 = await userTestFactory.buildAndInsertOne(db, {
        id: "test-seller-id-1",
        name: "Test Seller 1",
        email: "seller1@example.com",
      });

      const seller2 = await userTestFactory.buildAndInsertOne(db, {
        id: "test-seller-id-2",
        name: "Test Seller 2",
        email: "seller2@example.com",
      });

      const buyer2 = await userTestFactory.buildAndInsertOne(db, {
        id: "test-buyer-id-2",
        name: "Test Buyer 2",
        email: "buyer2@example.com",
      });

      // Create payment methods and locations
      const paymentMethod1 =
        await paymentMethodTestFactory.buildAndInsertOneWithDependencies(db, {
          id: "test-payment-method-id-1",
          userId: buyer1.id,
        });

      const paymentMethod2 =
        await paymentMethodTestFactory.buildAndInsertOneWithDependencies(db, {
          id: "test-payment-method-id-2",
          userId: user.id,
        });

      const paymentMethod3 =
        await paymentMethodTestFactory.buildAndInsertOneWithDependencies(db, {
          id: "test-payment-method-id-3",
          userId: buyer2.id,
        });

      const location1 =
        await locationTestFactory.buildAndInsertOneWithDependencies(db, {
          id: "test-location-id-1",
          userId: user.id,
        });

      const location2 =
        await locationTestFactory.buildAndInsertOneWithDependencies(db, {
          id: "test-location-id-2",
          userId: seller1.id,
        });

      const location3 =
        await locationTestFactory.buildAndInsertOneWithDependencies(db, {
          id: "test-location-id-3",
          userId: seller2.id,
        });

      // Create deals where user is seller
      const deal1 = await dealTestFactory.insertOne(db, {
        id: "test-deal-id-1",
        sellerId: user.id,
        buyerId: buyer1.id,
        status: "negotiating",
        totalAmount: "100.00",
        paymentMethodId: paymentMethod1.id,
        shippingLocationId: location1.id,
      });

      // Create deals where user is buyer
      const deal2 = await dealTestFactory.insertOne(db, {
        id: "test-deal-id-2",
        sellerId: seller1.id,
        buyerId: user.id,
        status: "completed",
        totalAmount: "250.00",
        paymentMethodId: paymentMethod2.id,
        shippingLocationId: location2.id,
        finalizedAt: new Date("2023-01-01"),
      });

      // Create a deal for a different user
      await dealTestFactory.insertOne(db, {
        id: "test-deal-id-3",
        sellerId: seller2.id,
        buyerId: buyer2.id,
        status: "negotiating",
        totalAmount: "300.00",
        paymentMethodId: paymentMethod3.id,
        shippingLocationId: location3.id,
      });

      const result = await getAllDealsForUserQuery(db, user.id);

      expect(result.deals).toHaveLength(2);
      expect(result.totalCount).toBe(2);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(50);
      expect(result.totalPages).toBe(1);
      expect(result.deals.some((d) => d.id === deal1.id)).toBe(true);
      expect(result.deals.some((d) => d.id === deal2.id)).toBe(true);
      expect(
        result.deals.every(
          (d) => d.sellerId === user.id || d.buyerId === user.id
        )
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
      // Create dependencies first
      const user = await userTestFactory.buildAndInsertOne(db, {
        id: "test-user-id-pagination",
        name: "Test User Pagination",
        email: "pagination@example.com",
      });

      // Create multiple deals for the user
      for (let i = 1; i <= 5; i++) {
        const otherUser = await userTestFactory.buildAndInsertOne(db, {
          id: `test-other-user-id-${i}`,
          name: `Test Other User ${i}`,
          email: `other${i}@example.com`,
        });

        const paymentMethod =
          await paymentMethodTestFactory.buildAndInsertOneWithDependencies(db, {
            id: `test-payment-method-id-${i}`,
            userId: i % 2 === 0 ? user.id : otherUser.id,
          });

        const location =
          await locationTestFactory.buildAndInsertOneWithDependencies(db, {
            id: `test-location-id-${i}`,
            userId: i % 2 === 0 ? otherUser.id : user.id,
          });

        await dealTestFactory.insertOne(db, {
          id: `test-deal-id-${i}`,
          sellerId: i % 2 === 0 ? user.id : otherUser.id,
          buyerId: i % 2 === 0 ? otherUser.id : user.id,
          status: i % 2 === 0 ? "completed" : "negotiating",
          totalAmount: `${100 + i * 10}.00`,
          paymentMethodId: paymentMethod.id,
          shippingLocationId: location.id,
        });
      }

      const result = await getAllDealsForUserQuery(db, user.id, {
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
      // Create dependencies first
      const user = await userTestFactory.buildAndInsertOne(db, {
        id: "test-user-id-ordering",
        name: "Test User Ordering",
        email: "ordering@example.com",
      });

      const buyer1 = await userTestFactory.buildAndInsertOne(db, {
        id: "test-buyer-id-ordering-1",
        name: "Test Buyer Ordering 1",
        email: "buyer-ordering-1@example.com",
      });

      const seller1 = await userTestFactory.buildAndInsertOne(db, {
        id: "test-seller-id-ordering-1",
        name: "Test Seller Ordering 1",
        email: "seller-ordering-1@example.com",
      });

      const paymentMethod1 =
        await paymentMethodTestFactory.buildAndInsertOneWithDependencies(db, {
          id: "test-payment-method-id-ordering-1",
          userId: buyer1.id,
        });

      const paymentMethod2 =
        await paymentMethodTestFactory.buildAndInsertOneWithDependencies(db, {
          id: "test-payment-method-id-ordering-2",
          userId: user.id,
        });

      const location1 =
        await locationTestFactory.buildAndInsertOneWithDependencies(db, {
          id: "test-location-id-ordering-1",
          userId: user.id,
        });

      const location2 =
        await locationTestFactory.buildAndInsertOneWithDependencies(db, {
          id: "test-location-id-ordering-2",
          userId: seller1.id,
        });

      const deal1 = await dealTestFactory.insertOne(db, {
        id: "test-deal-id-ordering-1",
        sellerId: user.id,
        buyerId: buyer1.id,
        status: "negotiating",
        totalAmount: "100.00",
        paymentMethodId: paymentMethod1.id,
        shippingLocationId: location1.id,
        createdAt: new Date("2023-01-01"),
      });

      const deal2 = await dealTestFactory.insertOne(db, {
        id: "test-deal-id-ordering-2",
        sellerId: seller1.id,
        buyerId: user.id,
        status: "completed",
        totalAmount: "250.00",
        paymentMethodId: paymentMethod2.id,
        shippingLocationId: location2.id,
        createdAt: new Date("2023-01-02"),
      });

      const result = await getAllDealsForUserQuery(db, user.id);

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

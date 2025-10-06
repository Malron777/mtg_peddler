import { userTestFactory } from "@/src/domain/auth/user.model.test-factory";
import { dealTestFactory } from "@/src/domain/tcg/deal.model.test-factory";
import { buildRunWithTestDb, migrateTestDb } from "@/test-db";
import { beforeAll, describe, expect, it } from "vitest";
import { DB } from "../../db/db";
import { getActiveTradesCountQuery } from "./get-active-trades-count.query";

describe("getActiveTradesCountQuery", () => {
  let runWithTestDb: Awaited<ReturnType<typeof buildRunWithTestDb>>;

  beforeAll(async () => {
    await migrateTestDb();
    runWithTestDb = await buildRunWithTestDb();
  });

  it("should return count of active trades for a specific user", async () => {
    await runWithTestDb(async (db: DB) => {
      // Create test users
      const seller = await userTestFactory.buildAndInsertOne(db, {
        email: "seller@test.com",
        name: "Test Seller",
      });

      const buyer = await userTestFactory.buildAndInsertOne(db, {
        email: "buyer@test.com",
        name: "Test Buyer",
      });

      // Create active deals
      await dealTestFactory.buildAndInsertOne(db, {
        sellerId: seller.id,
        buyerId: buyer.id,
        status: "negotiating",
        totalAmount: "100.00",
      });

      await dealTestFactory.buildAndInsertOne(db, {
        sellerId: seller.id,
        buyerId: buyer.id,
        status: "accepted",
        totalAmount: "200.00",
      });

      // Create inactive deal
      await dealTestFactory.buildAndInsertOne(db, {
        sellerId: seller.id,
        buyerId: buyer.id,
        status: "completed",
        totalAmount: "300.00",
      });

      const result = await getActiveTradesCountQuery(db, { userId: seller.id });

      expect(result).toHaveLength(1);
      expect(result[0].count).toBe(2);
      expect(result[0].userId).toBe(seller.id);
    });
  });

  it("should return count of active trades for multiple users", async () => {
    await runWithTestDb(async (db: DB) => {
      // Create test users
      const user1 = await userTestFactory.buildAndInsertOne(db, {
        email: "user1@test.com",
        name: "User 1",
      });

      const user2 = await userTestFactory.buildAndInsertOne(db, {
        email: "user2@test.com",
        name: "User 2",
      });

      const user3 = await userTestFactory.buildAndInsertOne(db, {
        email: "user3@test.com",
        name: "User 3",
      });

      // Create active deals
      await dealTestFactory.buildAndInsertOne(db, {
        sellerId: user1.id,
        buyerId: user2.id,
        status: "negotiating",
        totalAmount: "100.00",
      });

      await dealTestFactory.buildAndInsertOne(db, {
        sellerId: user2.id,
        buyerId: user3.id,
        status: "accepted",
        totalAmount: "200.00",
      });

      await dealTestFactory.buildAndInsertOne(db, {
        sellerId: user3.id,
        buyerId: user1.id,
        status: "payment_pending",
        totalAmount: "300.00",
      });

      const result = await getActiveTradesCountQuery(db, {
        userIds: [user1.id, user2.id, user3.id],
      });

      expect(result).toHaveLength(3);

      // Each user should have 2 active trades (1 as seller, 1 as buyer)
      const user1Result = result.find((r) => r.userId === user1.id);
      const user2Result = result.find((r) => r.userId === user2.id);
      const user3Result = result.find((r) => r.userId === user3.id);

      expect(user1Result?.count).toBe(2);
      expect(user2Result?.count).toBe(2);
      expect(user3Result?.count).toBe(2);
    });
  });

  it("should return total count of all active trades when no user specified", async () => {
    await runWithTestDb(async (db: DB) => {
      // Create test users
      const seller = await userTestFactory.buildAndInsertOne(db, {
        email: "seller@test.com",
        name: "Test Seller",
      });

      const buyer = await userTestFactory.buildAndInsertOne(db, {
        email: "buyer@test.com",
        name: "Test Buyer",
      });

      // Create active deals
      await dealTestFactory.buildAndInsertOne(db, {
        sellerId: seller.id,
        buyerId: buyer.id,
        status: "negotiating",
        totalAmount: "100.00",
      });

      await dealTestFactory.buildAndInsertOne(db, {
        sellerId: seller.id,
        buyerId: buyer.id,
        status: "shipped",
        totalAmount: "200.00",
      });

      // Create inactive deal
      await dealTestFactory.buildAndInsertOne(db, {
        sellerId: seller.id,
        buyerId: buyer.id,
        status: "completed",
        totalAmount: "300.00",
      });

      const result = await getActiveTradesCountQuery(db);

      expect(result).toHaveLength(1);
      expect(result[0].count).toBe(2);
      expect(result[0].userId).toBeUndefined();
    });
  });

  it("should return empty result when no active trades exist", async () => {
    await runWithTestDb(async (db: DB) => {
      const result = await getActiveTradesCountQuery(db);

      expect(result).toHaveLength(1);
      expect(result[0].count).toBe(0);
    });
  });

  it("should exclude inactive deal statuses", async () => {
    await runWithTestDb(async (db: DB) => {
      // Create test users
      const seller = await userTestFactory.buildAndInsertOne(db, {
        email: "seller@test.com",
        name: "Test Seller",
      });

      const buyer = await userTestFactory.buildAndInsertOne(db, {
        email: "buyer@test.com",
        name: "Test Buyer",
      });

      // Create inactive deals
      await dealTestFactory.buildAndInsertOne(db, {
        sellerId: seller.id,
        buyerId: buyer.id,
        status: "completed",
        totalAmount: "100.00",
      });

      await dealTestFactory.buildAndInsertOne(db, {
        sellerId: seller.id,
        buyerId: buyer.id,
        status: "rejected",
        totalAmount: "200.00",
      });

      await dealTestFactory.buildAndInsertOne(db, {
        sellerId: seller.id,
        buyerId: buyer.id,
        status: "expired",
        totalAmount: "300.00",
      });

      await dealTestFactory.buildAndInsertOne(db, {
        sellerId: seller.id,
        buyerId: buyer.id,
        status: "disputed",
        totalAmount: "400.00",
      });

      const result = await getActiveTradesCountQuery(db, { userId: seller.id });

      expect(result).toHaveLength(1);
      expect(result[0].count).toBe(0);
    });
  });
});


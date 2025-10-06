import { userTestFactory } from "@/src/domain/auth/user.model.test-factory";
import { buildRunWithTestDb, migrateTestDb } from "@/test-db";
import { beforeAll, describe, expect, it } from "vitest";
import { DB } from "../../db/db";
import { getAllUsersQuery } from "./get-all-users.query";

describe("getAllUsersQuery", () => {
  let runWithTestDb: Awaited<ReturnType<typeof buildRunWithTestDb>>;

  beforeAll(async () => {
    await migrateTestDb();
    runWithTestDb = await buildRunWithTestDb();
  });

  it("should return all users with default pagination", async () => {
    await runWithTestDb(async (db: DB) => {
      // Insert test users
      const user1 = await userTestFactory.buildAndInsertOne(db, {
        id: "test-user-id-1",
        name: "First User",
        email: "first@example.com",
        emailVerified: true,
        image: "https://example.com/first-avatar.jpg",
        reputationScore: "100",
        role: "user",
        preferredCurrency: "USD",
        notificationPreferences: { email: true, sms: false, push: true },
      });

      const user2 = await userTestFactory.buildAndInsertOne(db, {
        id: "test-user-id-2",
        name: "Second User",
        email: "second@example.com",
        emailVerified: true,
        image: "https://example.com/second-avatar.jpg",
        reputationScore: "200",
        role: "admin",
        preferredCurrency: "EUR",
        notificationPreferences: { email: true, sms: true, push: true },
      });

      const result = await getAllUsersQuery(db);

      expect(result.users).toHaveLength(2);
      expect(result.totalCount).toBe(2);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(50);
      expect(result.totalPages).toBe(1);
      expect(result.users.some((u) => u.id === user1.id)).toBe(true);
      expect(result.users.some((u) => u.id === user2.id)).toBe(true);
    });
  });

  it("should return empty result when no users exist", async () => {
    await runWithTestDb(async (db: DB) => {
      const result = await getAllUsersQuery(db);

      expect(result.users).toHaveLength(0);
      expect(result.totalCount).toBe(0);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(50);
      expect(result.totalPages).toBe(0);
    });
  });

  it("should handle custom pagination options", async () => {
    await runWithTestDb(async (db: DB) => {
      // Insert multiple users
      for (let i = 1; i <= 5; i++) {
        await userTestFactory.buildAndInsertOne(db, {
          id: `test-user-id-${i}`,
          name: `Test User ${i}`,
          email: `user${i}@example.com`,
          emailVerified: i % 2 === 0,
          image: `https://example.com/avatar${i}.jpg`,
          reputationScore: `${i * 100}`,
          role: i % 2 === 0 ? "admin" : "user",
          preferredCurrency: i % 2 === 0 ? "EUR" : "USD",
          notificationPreferences: {
            email: true,
            sms: i % 2 === 0,
            push: true,
          },
        });
      }

      const result = await getAllUsersQuery(db, { page: 2, pageSize: 2 });

      expect(result.users).toHaveLength(2);
      expect(result.totalCount).toBe(5);
      expect(result.page).toBe(2);
      expect(result.pageSize).toBe(2);
      expect(result.totalPages).toBe(3);
    });
  });

  it("should handle invalid pagination options gracefully", async () => {
    await runWithTestDb(async (db: DB) => {
      await userTestFactory.buildAndInsertOne(db, {
        id: "test-user-id-1",
        name: "Test User",
        email: "test@example.com",
        emailVerified: true,
        image: "https://example.com/avatar.jpg",
        reputationScore: "100",
        role: "user",
        preferredCurrency: "USD",
        notificationPreferences: { email: true, sms: false, push: true },
      });

      const result = await getAllUsersQuery(db, { page: 0, pageSize: -1 });

      expect(result.users).toHaveLength(1);
      expect(result.totalCount).toBe(1);
      expect(result.page).toBe(0);
      expect(result.pageSize).toBe(-1);
      expect(result.totalPages).toBe(-1);
    });
  });

  it("should order users by createdAt descending", async () => {
    await runWithTestDb(async (db: DB) => {
      const user1 = await userTestFactory.buildAndInsertOne(db, {
        id: "test-user-id-1",
        name: "First User",
        email: "first@example.com",
        emailVerified: true,
        image: "https://example.com/first-avatar.jpg",
        reputationScore: "100",
        role: "user",
        preferredCurrency: "USD",
        notificationPreferences: { email: true, sms: false, push: true },
        createdAt: new Date("2023-01-01"),
      });

      // Wait a bit to ensure different timestamps
      await new Promise((resolve) => setTimeout(resolve, 10));

      const user2 = await userTestFactory.buildAndInsertOne(db, {
        id: "test-user-id-2",
        name: "Second User",
        email: "second@example.com",
        emailVerified: true,
        image: "https://example.com/second-avatar.jpg",
        reputationScore: "200",
        role: "admin",
        preferredCurrency: "EUR",
        notificationPreferences: { email: true, sms: true, push: true },
        createdAt: new Date("2023-01-02"),
      });

      const result = await getAllUsersQuery(db);

      expect(result.users).toHaveLength(2);
      expect(result.users[0].id).toBe(user2.id); // Most recent first
      expect(result.users[1].id).toBe(user1.id);
    });
  });

  it("should handle large page sizes gracefully", async () => {
    await runWithTestDb(async (db: DB) => {
      // Create a few users
      for (let i = 1; i <= 3; i++) {
        await userTestFactory.buildAndInsertOne(db, {
          id: `test-user-id-${i}`,
          name: `Test User ${i}`,
          email: `user${i}@example.com`,
          emailVerified: true,
          image: `https://example.com/avatar${i}.jpg`,
          reputationScore: `${i * 100}`,
          role: "user",
          preferredCurrency: "USD",
          notificationPreferences: { email: true, sms: false, push: true },
        });
      }

      const result = await getAllUsersQuery(db, { page: 1, pageSize: 1000 });

      expect(result.users).toHaveLength(3);
      expect(result.totalCount).toBe(3);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(1000);
      expect(result.totalPages).toBe(1);
    });
  });
});

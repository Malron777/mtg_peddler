import { userTestFactory } from "@/src/domain/auth/user.model.test-factory";
import { locationTestFactory } from "@/src/domain/tcg/location.model.test-factory";
import { buildRunWithTestDb, migrateTestDb } from "@/test-db";
import { beforeAll, describe, expect, it } from "vitest";
import { DB } from "../../db/db";
import { getAllLocationsForUserQuery } from "./get-all-locations-for-user.query";

describe("getAllLocationsForUserQuery", () => {
  let runWithTestDb: Awaited<ReturnType<typeof buildRunWithTestDb>>;

  beforeAll(async () => {
    await migrateTestDb();
    runWithTestDb = await buildRunWithTestDb();
  });

  it("should return all locations for a user with default pagination", async () => {
    await runWithTestDb(async (db: DB) => {
      const user = await userTestFactory.insertOne(db, {
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

      const location1 = await locationTestFactory.insertOne(db, {
        userId: user.id,
        type: "address",
        name: "Home Address",
        addressDetails: {
          street: "123 Home St",
          city: "Home City",
        },
        isPrimary: true,
      });

      const location2 = await locationTestFactory.insertOne(db, {
        userId: user.id,
        type: "pudo",
        name: "Work Location",
        addressDetails: {
          street: "456 Work Ave",
          city: "Work City",
        },
        isPrimary: false,
      });

      const result = await getAllLocationsForUserQuery(db, user.id);

      expect(result.locations).toHaveLength(2);
      expect(result.totalCount).toBe(2);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(50);
      expect(result.totalPages).toBe(1);
      expect(result.locations.some((l) => l.id === location1.id)).toBe(true);
      expect(result.locations.some((l) => l.id === location2.id)).toBe(true);
    });
  });

  it("should return empty result when user has no locations", async () => {
    await runWithTestDb(async (db: DB) => {
      const user = await userTestFactory.insertOne(db, {
        id: "test-user-id-2",
        name: "Test User 2",
        email: "test2@example.com",
        emailVerified: true,
        image: "https://example.com/avatar2.jpg",
        reputationScore: "200",
        role: "user",
        preferredCurrency: "EUR",
        notificationPreferences: { email: true, sms: true, push: true },
      });

      const result = await getAllLocationsForUserQuery(db, user.id);

      expect(result.locations).toHaveLength(0);
      expect(result.totalCount).toBe(0);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(50);
      expect(result.totalPages).toBe(0);
    });
  });

  it("should handle custom pagination options", async () => {
    await runWithTestDb(async (db: DB) => {
      const user = await userTestFactory.insertOne(db, {
        id: "test-user-id-3",
        name: "Test User 3",
        email: "test3@example.com",
        emailVerified: true,
        image: "https://example.com/avatar3.jpg",
        reputationScore: "300",
        role: "user",
        preferredCurrency: "USD",
        notificationPreferences: { email: true, sms: false, push: true },
      });

      // Insert multiple locations
      for (let i = 1; i <= 5; i++) {
        await locationTestFactory.insertOne(db, {
          userId: user.id,
          type: i % 2 === 0 ? "pudo" : "address",
          name: `Location ${i}`,
          addressDetails: {
            street: `${i}00 Test St`,
            city: `Test City ${i}`,
          },
          isPrimary: i === 1,
        });
      }

      const result = await getAllLocationsForUserQuery(db, user.id, {
        page: 2,
        pageSize: 2,
      });

      expect(result.locations).toHaveLength(2);
      expect(result.totalCount).toBe(5);
      expect(result.page).toBe(2);
      expect(result.pageSize).toBe(2);
      expect(result.totalPages).toBe(3);
    });
  });

  it("should only return locations for the specified user", async () => {
    await runWithTestDb(async (db: DB) => {
      const user1 = await userTestFactory.insertOne(db, {
        id: "test-user-id-4",
        name: "Test User 4",
        email: "test4@example.com",
        emailVerified: true,
        image: "https://example.com/avatar4.jpg",
        reputationScore: "400",
        role: "user",
        preferredCurrency: "USD",
        notificationPreferences: { email: true, sms: false, push: true },
      });

      const user2 = await userTestFactory.insertOne(db, {
        id: "test-user-id-5",
        name: "Test User 5",
        email: "test5@example.com",
        emailVerified: true,
        image: "https://example.com/avatar5.jpg",
        reputationScore: "500",
        role: "user",
        preferredCurrency: "EUR",
        notificationPreferences: { email: true, sms: true, push: true },
      });

      const location1 = await locationTestFactory.insertOne(db, {
        userId: user1.id,
        type: "address",
        name: "User 1 Location",
        addressDetails: {
          street: "111 User1 St",
          city: "User1 City",
        },
        isPrimary: false,
      });

      const location2 = await locationTestFactory.insertOne(db, {
        userId: user2.id,
        type: "pudo",
        name: "User 2 Location",
        addressDetails: {
          street: "222 User2 Ave",
          city: "User2 City",
        },
        isPrimary: false,
      });

      const result = await getAllLocationsForUserQuery(db, user1.id);

      expect(result.locations).toHaveLength(1);
      expect(result.totalCount).toBe(1);
      expect(result.locations[0].id).toBe(location1.id);
      expect(result.locations[0].userId).toBe(user1.id);
    });
  });

  it("should order locations by createdAt descending", async () => {
    await runWithTestDb(async (db: DB) => {
      const user = await userTestFactory.insertOne(db, {
        id: "test-user-id-6",
        name: "Test User 6",
        email: "test6@example.com",
        emailVerified: true,
        image: "https://example.com/avatar6.jpg",
        reputationScore: "600",
        role: "user",
        preferredCurrency: "USD",
        notificationPreferences: { email: true, sms: false, push: true },
      });

      const location1 = await locationTestFactory.insertOne(db, {
        userId: user.id,
        type: "address",
        name: "First Location",
        addressDetails: {
          street: "111 First St",
          city: "First City",
        },
        isPrimary: false,
        createdAt: new Date("2023-01-01"),
      });

      // Wait a bit to ensure different timestamps
      await new Promise((resolve) => setTimeout(resolve, 10));

      const location2 = await locationTestFactory.insertOne(db, {
        userId: user.id,
        type: "pudo",
        name: "Second Location",
        addressDetails: {
          street: "222 Second Ave",
          city: "Second City",
        },
        isPrimary: false,
        createdAt: new Date("2023-01-02"),
      });

      const result = await getAllLocationsForUserQuery(db, user.id);

      expect(result.locations).toHaveLength(2);
      expect(result.locations[0].id).toBe(location2.id); // Most recent first
      expect(result.locations[1].id).toBe(location1.id);
    });
  });

  it("should handle invalid user ID gracefully", async () => {
    await runWithTestDb(async (db: DB) => {
      const result = await getAllLocationsForUserQuery(
        db,
        "non-existent-user-id"
      );

      expect(result.locations).toHaveLength(0);
      expect(result.totalCount).toBe(0);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(50);
      expect(result.totalPages).toBe(0);
    });
  });

  it("should handle empty user ID gracefully", async () => {
    await runWithTestDb(async (db: DB) => {
      const result = await getAllLocationsForUserQuery(db, "");

      expect(result.locations).toHaveLength(0);
      expect(result.totalCount).toBe(0);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(50);
      expect(result.totalPages).toBe(0);
    });
  });

  it("should handle large page sizes gracefully", async () => {
    await runWithTestDb(async (db: DB) => {
      const user = await userTestFactory.insertOne(db, {
        id: "test-user-id-7",
        name: "Test User 7",
        email: "test7@example.com",
        emailVerified: true,
        image: "https://example.com/avatar7.jpg",
        reputationScore: "700",
        role: "user",
        preferredCurrency: "USD",
        notificationPreferences: { email: true, sms: false, push: true },
      });

      // Create a few locations
      for (let i = 1; i <= 3; i++) {
        await locationTestFactory.insertOne(db, {
          userId: user.id,
          type: "address",
          name: `Location ${i}`,
          addressDetails: {
            street: `${i}00 Large St`,
            city: `Large City ${i}`,
          },
          isPrimary: i === 1,
        });
      }

      const result = await getAllLocationsForUserQuery(db, user.id, {
        page: 1,
        pageSize: 1000,
      });

      expect(result.locations).toHaveLength(3);
      expect(result.totalCount).toBe(3);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(1000);
      expect(result.totalPages).toBe(1);
    });
  });
});

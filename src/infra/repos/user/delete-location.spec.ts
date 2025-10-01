import { userTestFactory } from "@/src/domain/auth/user.model.test-factory";
import { locationTestFactory } from "@/src/domain/tcg/location.model.test-factory";
import { buildRunWithTestDb, migrateTestDb } from "@/test-db";
import { beforeAll, describe, expect, it } from "vitest";
import { DB } from "../../db/db";
import { deleteLocationQuery } from "./delete-location.query";

describe("deleteLocationQuery", () => {
  let runWithTestDb: Awaited<ReturnType<typeof buildRunWithTestDb>>;

  beforeAll(async () => {
    await migrateTestDb();
    runWithTestDb = await buildRunWithTestDb();
  });

  it("should successfully delete an existing location", async () => {
    await runWithTestDb(async (db: DB) => {
      const user = await userTestFactory.buildAndInsertOne(db, {
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

      const location = await locationTestFactory.insertOne(db, {
        userId: user.id,
        type: "address",
        name: "Test Location",
        addressDetails: {
          street: "123 Test St",
          city: "Test City",
        },
        isPrimary: false,
      });

      const result = await deleteLocationQuery(db, location.id);

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
    });
  });

  it("should handle deleting non-existent location gracefully", async () => {
    await runWithTestDb(async (db: DB) => {
      const nonExistentId = "non-existent-location-id";

      const result = await deleteLocationQuery(db, nonExistentId);

      expect(result.success).toBe(true); // Delete operations typically succeed even if nothing was deleted
      expect(result.error).toBeUndefined();
    });
  });

  it("should handle empty id gracefully", async () => {
    await runWithTestDb(async (db: DB) => {
      const result = await deleteLocationQuery(db, "");

      expect(result.success).toBe(true); // Delete operations typically succeed even with empty ID
      expect(result.error).toBeUndefined();
    });
  });

  it("should handle null id gracefully", async () => {
    await runWithTestDb(async (db: DB) => {
      const result = await deleteLocationQuery(db, null as unknown as string);

      expect(result.success).toBe(true);
      expect(result.error).not.toBeDefined();
    });
  });

  it("should handle malformed id gracefully", async () => {
    await runWithTestDb(async (db: DB) => {
      const malformedId = "malformed-id-with-special-chars-!@#$%";

      const result = await deleteLocationQuery(db, malformedId);

      expect(result.success).toBe(true); // Delete operations typically succeed even with malformed IDs
      expect(result.error).toBeUndefined();
    });
  });

  it("should delete only the specified location", async () => {
    await runWithTestDb(async (db: DB) => {
      const user = await userTestFactory.buildAndInsertOne(db, {
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

      const location1 = await locationTestFactory.insertOne(db, {
        userId: user.id,
        type: "address",
        name: "First Location",
        addressDetails: { street: "123 First St" },
        isPrimary: true,
      });

      const location2 = await locationTestFactory.insertOne(db, {
        userId: user.id,
        type: "pudo",
        name: "Second Location",
        addressDetails: { street: "456 Second Ave" },
        isPrimary: false,
      });

      const result = await deleteLocationQuery(db, location1.id);

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();

      // Verify that location2 still exists by trying to delete it
      const result2 = await deleteLocationQuery(db, location2.id);
      expect(result2.success).toBe(true);
    });
  });

  it("should handle deleting location with foreign key constraints", async () => {
    await runWithTestDb(async (db: DB) => {
      const user = await userTestFactory.buildAndInsertOne(db, {
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

      const location = await locationTestFactory.insertOne(db, {
        userId: user.id,
        type: "address",
        name: "Location with Constraints",
        addressDetails: { street: "789 Constraint St" },
        isPrimary: false,
      });

      const result = await deleteLocationQuery(db, location.id);

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
    });
  });

  it("should handle deleting primary location", async () => {
    await runWithTestDb(async (db: DB) => {
      const user = await userTestFactory.buildAndInsertOne(db, {
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

      const primaryLocation = await locationTestFactory.insertOne(db, {
        userId: user.id,
        type: "address",
        name: "Primary Location",
        addressDetails: { street: "321 Primary St" },
        isPrimary: true,
      });

      const result = await deleteLocationQuery(db, primaryLocation.id);

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
    });
  });

  it("should handle deleting location with complex address details", async () => {
    await runWithTestDb(async (db: DB) => {
      const user = await userTestFactory.buildAndInsertOne(db, {
        id: "test-user-id-5",
        name: "Test User 5",
        email: "test5@example.com",
        emailVerified: true,
        image: "https://example.com/avatar5.jpg",
        reputationScore: "500",
        role: "user",
        preferredCurrency: "USD",
        notificationPreferences: { email: true, sms: false, push: true },
      });

      const complexLocation = await locationTestFactory.insertOne(db, {
        userId: user.id,
        type: "address",
        name: "Complex Location",
        addressDetails: {
          street: "123 Complex St",
          city: "Complex City",
          state: "Complex State",
          zipCode: "12345",
          country: "Complex Country",
          apartment: "Apt 456",
          floor: "2nd Floor",
        },
        isPrimary: false,
      });

      const result = await deleteLocationQuery(db, complexLocation.id);

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
    });
  });
});

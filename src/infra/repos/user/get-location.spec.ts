import { userTestFactory } from "@/src/domain/auth/user.model.test-factory";
import { locationTestFactory } from "@/src/domain/tcg/location.model.test-factory";
import { buildRunWithTestDb, migrateTestDb } from "@/test-db";
import { beforeAll, describe, expect, it } from "vitest";
import { DB } from "../../db/db";
import { getLocationQuery } from "./get-location.query";

describe("getLocationQuery", () => {
  let runWithTestDb: Awaited<ReturnType<typeof buildRunWithTestDb>>;

  beforeAll(async () => {
    await migrateTestDb();
    runWithTestDb = await buildRunWithTestDb();
  });

  it("should successfully retrieve an existing location", async () => {
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

      const location = await locationTestFactory.insertOne(db, {
        userId: user.id,
        type: "address",
        name: "Test Location",
        addressDetails: {
          street: "123 Test St",
          city: "Test City",
          state: "Test State",
          zipCode: "12345",
          country: "Test Country",
        },
        isPrimary: true,
      });

      const result = await getLocationQuery(db, location.id);

      expect(result.success).toBe(true);
      expect(result.location).toBeDefined();
      expect(result.location?.id).toBe(location.id);
      expect(result.location?.userId).toBe(user.id);
      expect(result.location?.type).toBe("address");
      expect(result.location?.name).toBe("Test Location");
      expect(result.location?.addressDetails).toEqual({
        street: "123 Test St",
        city: "Test City",
        state: "Test State",
        zipCode: "12345",
        country: "Test Country",
      });
      expect(result.location?.isPrimary).toBe(true);
      expect(result.error).toBeUndefined();
    });
  });

  it("should return error when location is not found", async () => {
    await runWithTestDb(async (db: DB) => {
      const nonExistentId = "non-existent-location-id";

      const result = await getLocationQuery(db, nonExistentId);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Location not found");
      expect(result.location).toBeUndefined();
    });
  });

  it("should handle empty id gracefully", async () => {
    await runWithTestDb(async (db: DB) => {
      const result = await getLocationQuery(db, "");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Location not found");
      expect(result.location).toBeUndefined();
    });
  });

  it("should handle null id gracefully", async () => {
    await runWithTestDb(async (db: DB) => {
      const result = await getLocationQuery(db, null as unknown as string);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.location).toBeUndefined();
    });
  });

  it("should handle malformed id gracefully", async () => {
    await runWithTestDb(async (db: DB) => {
      const malformedId = "malformed-id-with-special-chars-!@#$%";

      const result = await getLocationQuery(db, malformedId);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Location not found");
      expect(result.location).toBeUndefined();
    });
  });

  it("should retrieve a pickup location", async () => {
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

      const pickupLocation = await locationTestFactory.insertOne(db, {
        userId: user.id,
        type: "pudo",
        name: "Pickup Location",
        addressDetails: {
          street: "456 Pickup Ave",
          city: "Pickup City",
        },
        isPrimary: false,
      });

      const result = await getLocationQuery(db, pickupLocation.id);

      expect(result.success).toBe(true);
      expect(result.location).toBeDefined();
      expect(result.location?.type).toBe("pickup");
      expect(result.location?.name).toBe("Pickup Location");
      expect(result.location?.isPrimary).toBe(false);
      expect(result.error).toBeUndefined();
    });
  });

  it("should retrieve a location with minimal address details", async () => {
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

      const minimalLocation = await locationTestFactory.insertOne(db, {
        userId: user.id,
        type: "address",
        name: "Minimal Location",
        addressDetails: {
          street: "789 Minimal St",
        },
        isPrimary: false,
      });

      const result = await getLocationQuery(db, minimalLocation.id);

      expect(result.success).toBe(true);
      expect(result.location).toBeDefined();
      expect(result.location?.addressDetails).toEqual({
        street: "789 Minimal St",
      });
      expect(result.error).toBeUndefined();
    });
  });

  it("should retrieve a location with complex address details", async () => {
    await runWithTestDb(async (db: DB) => {
      const user = await userTestFactory.insertOne(db, {
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

      const complexLocation = await locationTestFactory.insertOne(db, {
        userId: user.id,
        type: "address",
        name: "Complex Location",
        addressDetails: {
          street: "321 Complex St",
          city: "Complex City",
          state: "Complex State",
          zipCode: "54321",
          country: "Complex Country",
          apartment: "Apt 456",
          floor: "2nd Floor",
          building: "Building A",
          landmark: "Near the park",
        },
        isPrimary: false,
      });

      const result = await getLocationQuery(db, complexLocation.id);

      expect(result.success).toBe(true);
      expect(result.location).toBeDefined();
      expect(result.location?.addressDetails).toEqual({
        street: "321 Complex St",
        city: "Complex City",
        state: "Complex State",
        zipCode: "54321",
        country: "Complex Country",
        apartment: "Apt 456",
        floor: "2nd Floor",
        building: "Building A",
        landmark: "Near the park",
      });
      expect(result.error).toBeUndefined();
    });
  });

  it("should retrieve a non-primary location", async () => {
    await runWithTestDb(async (db: DB) => {
      const user = await userTestFactory.insertOne(db, {
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

      const nonPrimaryLocation = await locationTestFactory.insertOne(db, {
        userId: user.id,
        type: "address",
        name: "Non-Primary Location",
        addressDetails: {
          street: "654 Non-Primary St",
          city: "Non-Primary City",
        },
        isPrimary: false,
      });

      const result = await getLocationQuery(db, nonPrimaryLocation.id);

      expect(result.success).toBe(true);
      expect(result.location).toBeDefined();
      expect(result.location?.isPrimary).toBe(false);
      expect(result.error).toBeUndefined();
    });
  });
});

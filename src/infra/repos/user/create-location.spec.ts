import { userTestFactory } from "@/src/domain/auth/user.model.test-factory";
import { locationTestFactory } from "@/src/domain/tcg/location.model.test-factory";
import { buildRunWithTestDb, migrateTestDb } from "@/test-db";
import { beforeAll, describe, expect, it } from "vitest";
import { DB } from "../../db/db";
import { createLocationQuery } from "./create-location.query";

describe("createLocationQuery", () => {
  let runWithTestDb: Awaited<ReturnType<typeof buildRunWithTestDb>>;

  beforeAll(async () => {
    await migrateTestDb();
    runWithTestDb = await buildRunWithTestDb();
  });

  it("should successfully create a location", async () => {
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

      const locationData = locationTestFactory.buildOne({
        userId: user.id,
        type: "address",
        name: "Home Address",
        addressDetails: {
          street: "123 Main St",
          city: "Test City",
          state: "Test State",
          zipCode: "12345",
          country: "Test Country",
        },
        isPrimary: true,
      });

      const result = await createLocationQuery(db, locationData);

      expect(result.success).toBe(true);
      expect(result.location).toBeDefined();
      expect(result.location?.userId).toBe(user.id);
      expect(result.location?.type).toBe("address");
      expect(result.location?.name).toBe("Home Address");
      expect(result.location?.addressDetails).toEqual({
        street: "123 Main St",
        city: "Test City",
        state: "Test State",
        zipCode: "12345",
        country: "Test Country",
      });
      expect(result.location?.isPrimary).toBe(true);
      expect(result.error).toBeUndefined();
    });
  });

  it("should create a location with minimal data", async () => {
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

      const locationData = locationTestFactory.buildOne({
        userId: user.id,
        type: "pudo",
        name: "Pickup Location",
        addressDetails: { street: "456 Oak Ave" },
        isPrimary: false,
      });

      const result = await createLocationQuery(db, locationData);

      expect(result.success).toBe(true);
      expect(result.location).toBeDefined();
      expect(result.location?.userId).toBe(user.id);
      expect(result.location?.type).toBe("pickup");
      expect(result.location?.name).toBe("Pickup Location");
      expect(result.location?.addressDetails).toEqual({
        street: "456 Oak Ave",
      });
      expect(result.location?.isPrimary).toBe(false);
      expect(result.error).toBeUndefined();
    });
  });

  it("should handle invalid user ID gracefully", async () => {
    await runWithTestDb(async (db: DB) => {
      const locationData = locationTestFactory.buildOne({
        userId: "non-existent-user-id",
        type: "address",
        name: "Test Location",
        addressDetails: { street: "123 Test St" },
        isPrimary: false,
      });

      const result = await createLocationQuery(db, locationData);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.location).toBeUndefined();
    });
  });

  it("should handle missing required fields", async () => {
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

      const locationData = locationTestFactory.buildOne({
        userId: user.id,
        type: "address",
        name: "", // Empty name should fail
        addressDetails: {},
        isPrimary: false,
      });

      const result = await createLocationQuery(db, locationData);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.location).toBeUndefined();
    });
  });

  it("should create multiple locations for the same user", async () => {
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

      const location1Data = locationTestFactory.buildOne({
        userId: user.id,
        type: "address",
        name: "Home",
        addressDetails: { street: "123 Home St" },
        isPrimary: true,
      });

      const location2Data = locationTestFactory.buildOne({
        userId: user.id,
        type: "pudo",
        name: "Work",
        addressDetails: { street: "456 Work Ave" },
        isPrimary: false,
      });

      const result1 = await createLocationQuery(db, location1Data);
      const result2 = await createLocationQuery(db, location2Data);

      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);
      expect(result1.location?.name).toBe("Home");
      expect(result2.location?.name).toBe("Work");
      expect(result1.location?.isPrimary).toBe(true);
      expect(result2.location?.isPrimary).toBe(false);
    });
  });

  it("should handle different location types", async () => {
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

      const addressLocation = locationTestFactory.buildOne({
        userId: user.id,
        type: "address",
        name: "Address Location",
        addressDetails: { street: "123 Address St" },
        isPrimary: false,
      });

      const pickupLocation = locationTestFactory.buildOne({
        userId: user.id,
        type: "pudo",
        name: "Pickup Location",
        addressDetails: { street: "456 Pickup Ave" },
        isPrimary: false,
      });

      const result1 = await createLocationQuery(db, addressLocation);
      const result2 = await createLocationQuery(db, pickupLocation);

      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);
      expect(result1.location?.type).toBe("address");
      expect(result2.location?.type).toBe("pickup");
    });
  });
});

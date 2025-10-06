import { userTestFactory } from "@/src/domain/auth/user.model.test-factory";
import { locationTestFactory } from "@/src/domain/tcg/location.model.test-factory";
import { buildRunWithTestDb, migrateTestDb } from "@/test-db";
import { beforeAll, describe, expect, it } from "vitest";
import { DB } from "../../db/db";
import { updateLocationQuery } from "./update-location.query";

describe("updateLocationQuery", () => {
  let runWithTestDb: Awaited<ReturnType<typeof buildRunWithTestDb>>;

  beforeAll(async () => {
    await migrateTestDb();
    runWithTestDb = await buildRunWithTestDb();
  });

  it("should successfully update an existing location", async () => {
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
        name: "Original Location",
        addressDetails: {
          street: "123 Original St",
          city: "Original City",
        },
        isPrimary: false,
      });

      const updateData = {
        id: location.id,
        name: "Updated Location",
        addressDetails: {
          street: "456 Updated Ave",
          city: "Updated City",
          state: "Updated State",
          zipCode: "54321",
        },
        isPrimary: true,
      };

      const result = await updateLocationQuery(db, updateData);

      expect(result.id).toBe(location.id);
      expect(result.name).toBe("Updated Location");
      expect(result.addressDetails).toEqual({
        street: "456 Updated Ave",
        city: "Updated City",
        state: "Updated State",
        zipCode: "54321",
      });
      expect(result.isPrimary).toBe(true);
      expect(result.type).toBe(location.type); // Should remain unchanged
      expect(result.userId).toBe(location.userId); // Should remain unchanged
      expect(result.updatedAt).toBeDefined();
      expect(result.updatedAt.getTime()).toBeGreaterThan(
        location.updatedAt.getTime()
      );
    });
  });

  it("should return undefined when trying to update non-existent location", async () => {
    await runWithTestDb(async (db: DB) => {
      const updateData = {
        id: "non-existent-location-id",
        name: "Updated Location",
        isPrimary: true,
      };

      const result = await updateLocationQuery(db, updateData);

      expect(result).toBeUndefined();
    });
  });

  it("should handle partial updates correctly", async () => {
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

      const location = await locationTestFactory.insertOne(db, {
        userId: user.id,
        type: "pudo",
        name: "Original Pickup Location",
        addressDetails: {
          street: "789 Original Ave",
          city: "Original City",
        },
        isPrimary: false,
      });

      const updateData = {
        id: location.id,
        name: "Only Name Updated",
      };

      const result = await updateLocationQuery(db, updateData);

      expect(result.id).toBe(location.id);
      expect(result.name).toBe("Only Name Updated");
      expect(result.type).toBe(location.type); // Should remain unchanged
      expect(result.addressDetails).toEqual(location.addressDetails); // Should remain unchanged
      expect(result.isPrimary).toBe(location.isPrimary); // Should remain unchanged
      expect(result.userId).toBe(location.userId); // Should remain unchanged
      expect(result.updatedAt).toBeDefined();
    });
  });

  it("should handle empty update data gracefully", async () => {
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
        name: "Original Location",
        addressDetails: {
          street: "321 Original St",
          city: "Original City",
        },
        isPrimary: false,
      });

      const updateData = {
        id: location.id,
      };

      const result = await updateLocationQuery(db, updateData);

      expect(result.id).toBe(location.id);
      expect(result.name).toBe(location.name); // Should remain unchanged
      expect(result.type).toBe(location.type); // Should remain unchanged
      expect(result.addressDetails).toEqual(location.addressDetails); // Should remain unchanged
      expect(result.isPrimary).toBe(location.isPrimary); // Should remain unchanged
      expect(result.userId).toBe(location.userId); // Should remain unchanged
      expect(result.updatedAt).toBeDefined();
    });
  });

  it("should update location type", async () => {
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

      const location = await locationTestFactory.insertOne(db, {
        userId: user.id,
        type: "address",
        name: "Address Location",
        addressDetails: {
          street: "654 Address St",
          city: "Address City",
        },
        isPrimary: false,
      });

      const updateData = {
        id: location.id,
        type: "pudo" as const,
      };

      const result = await updateLocationQuery(db, updateData);

      expect(result.id).toBe(location.id);
      expect(result.type).toBe("pudo");
      expect(result.name).toBe(location.name); // Should remain unchanged
      expect(result.addressDetails).toEqual(location.addressDetails); // Should remain unchanged
      expect(result.isPrimary).toBe(location.isPrimary); // Should remain unchanged
      expect(result.updatedAt).toBeDefined();
    });
  });

  it("should update complex address details", async () => {
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

      const location = await locationTestFactory.insertOne(db, {
        userId: user.id,
        type: "address",
        name: "Simple Location",
        addressDetails: {
          street: "111 Simple St",
        },
        isPrimary: false,
      });

      const complexAddressDetails = {
        street: "999 Complex St",
        city: "Complex City",
        state: "Complex State",
        zipCode: "99999",
        country: "Complex Country",
        apartment: "Apt 999",
        floor: "9th Floor",
        building: "Building Z",
        landmark: "Near the complex",
      };

      const updateData = {
        id: location.id,
        addressDetails: complexAddressDetails,
      };

      const result = await updateLocationQuery(db, updateData);

      expect(result.id).toBe(location.id);
      expect(result.addressDetails).toEqual(complexAddressDetails);
      expect(result.name).toBe(location.name); // Should remain unchanged
      expect(result.type).toBe(location.type); // Should remain unchanged
      expect(result.isPrimary).toBe(location.isPrimary); // Should remain unchanged
      expect(result.updatedAt).toBeDefined();
    });
  });

  it("should handle invalid update data", async () => {
    await runWithTestDb(async (db: DB) => {
      const user = await userTestFactory.buildAndInsertOne(db, {
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

      const location = await locationTestFactory.insertOne(db, {
        userId: user.id,
        type: "address",
        name: "Test Location",
        addressDetails: {
          street: "222 Test St",
          city: "Test City",
        },
        isPrimary: false,
      });

      const updateData = {
        id: location.id,
        name: null as unknown as string, // Empty name should fail
        type: "pudo" as const,
      };

      await expect(updateLocationQuery(db, updateData)).rejects.toThrow();
    });
  });
});

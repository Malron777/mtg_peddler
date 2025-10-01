import { userTestFactory } from "@/src/domain/auth/user.model.test-factory";
import { buildRunWithTestDb, migrateTestDb } from "@/test-db";
import { beforeAll, describe, expect, it } from "vitest";
import { DB } from "../../db/db";
import { updateUserQuery } from "./update-user.query";

describe("updateUserQuery", () => {
  let runWithTestDb: Awaited<ReturnType<typeof buildRunWithTestDb>>;

  beforeAll(async () => {
    await migrateTestDb();
    runWithTestDb = await buildRunWithTestDb();
  });

  it("should successfully update an existing user", async () => {
    await runWithTestDb(async (db: DB) => {
      const user = await userTestFactory.insertOne(db, {
        id: "test-user-id-1",
        name: "Original Name",
        email: "original@example.com",
        emailVerified: true,
        image: "https://example.com/original-avatar.jpg",
        reputationScore: "100",
        role: "user",
        preferredCurrency: "USD",
        notificationPreferences: { email: true, sms: false, push: true },
      });

      const updateData = {
        id: user.id,
        name: "Updated Name",
        image: "https://example.com/updated-avatar.jpg",
        reputationScore: "200",
        role: "admin" as const,
        preferredCurrency: "EUR",
        notificationPreferences: { email: true, sms: true, push: false },
      };

      const result = await updateUserQuery(db, updateData);

      expect(result.id).toBe(user.id);
      expect(result.name).toBe("Updated Name");
      expect(result.image).toBe("https://example.com/updated-avatar.jpg");
      expect(result.reputationScore).toBe("200");
      expect(result.role).toBe("admin");
      expect(result.preferredCurrency).toBe("EUR");
      expect(result.notificationPreferences).toEqual({
        email: true,
        sms: true,
        push: false,
      });
      expect(result.email).toBe(user.email); // Should remain unchanged
      expect(result.emailVerified).toBe(user.emailVerified); // Should remain unchanged
      expect(result.updatedAt).toBeDefined();
      expect(result.updatedAt.getTime()).toBeGreaterThan(
        user.updatedAt.getTime()
      );
    });
  });

  it("should throw error when trying to update non-existent user", async () => {
    await runWithTestDb(async (db: DB) => {
      const updateData = {
        id: "non-existent-user-id",
        name: "Updated Name",
        reputationScore: "200",
      };

      await expect(updateUserQuery(db, updateData)).rejects.toThrow();
    });
  });

  it("should handle partial updates correctly", async () => {
    await runWithTestDb(async (db: DB) => {
      const user = await userTestFactory.insertOne(db, {
        id: "test-user-id-2",
        name: "Original Name",
        email: "original2@example.com",
        emailVerified: true,
        image: "https://example.com/original-avatar2.jpg",
        reputationScore: "100",
        role: "user",
        preferredCurrency: "USD",
        notificationPreferences: { email: true, sms: false, push: true },
      });

      const updateData = {
        id: user.id,
        name: "Only Name Updated",
      };

      const result = await updateUserQuery(db, updateData);

      expect(result.id).toBe(user.id);
      expect(result.name).toBe("Only Name Updated");
      expect(result.email).toBe(user.email); // Should remain unchanged
      expect(result.emailVerified).toBe(user.emailVerified); // Should remain unchanged
      expect(result.image).toBe(user.image); // Should remain unchanged
      expect(result.reputationScore).toBe(user.reputationScore); // Should remain unchanged
      expect(result.role).toBe(user.role); // Should remain unchanged
      expect(result.preferredCurrency).toBe(user.preferredCurrency); // Should remain unchanged
      expect(result.notificationPreferences).toEqual(
        user.notificationPreferences
      ); // Should remain unchanged
      expect(result.updatedAt).toBeDefined();
    });
  });

  it("should handle empty update data gracefully", async () => {
    await runWithTestDb(async (db: DB) => {
      const user = await userTestFactory.insertOne(db, {
        id: "test-user-id-3",
        name: "Original Name",
        email: "original3@example.com",
        emailVerified: true,
        image: "https://example.com/original-avatar3.jpg",
        reputationScore: "100",
        role: "user",
        preferredCurrency: "USD",
        notificationPreferences: { email: true, sms: false, push: true },
      });

      const updateData = {
        id: user.id,
      };

      const result = await updateUserQuery(db, updateData);

      expect(result.id).toBe(user.id);
      expect(result.name).toBe(user.name); // Should remain unchanged
      expect(result.email).toBe(user.email); // Should remain unchanged
      expect(result.emailVerified).toBe(user.emailVerified); // Should remain unchanged
      expect(result.image).toBe(user.image); // Should remain unchanged
      expect(result.reputationScore).toBe(user.reputationScore); // Should remain unchanged
      expect(result.role).toBe(user.role); // Should remain unchanged
      expect(result.preferredCurrency).toBe(user.preferredCurrency); // Should remain unchanged
      expect(result.notificationPreferences).toEqual(
        user.notificationPreferences
      ); // Should remain unchanged
      expect(result.updatedAt).toBeDefined();
    });
  });

  it("should handle invalid update data", async () => {
    await runWithTestDb(async (db: DB) => {
      const user = await userTestFactory.insertOne(db, {
        id: "test-user-id-4",
        name: "Original Name",
        email: "original4@example.com",
        emailVerified: true,
        image: "https://example.com/original-avatar4.jpg",
        reputationScore: "100",
        role: "user",
        preferredCurrency: "USD",
        notificationPreferences: { email: true, sms: false, push: true },
      });

      const updateData = {
        id: user.id,
        name: "", // Empty name should fail
        reputationScore: "invalid-score", // Invalid reputation score
        role: "user" as const,
      };

      await expect(updateUserQuery(db, updateData)).rejects.toThrow();
    });
  });
});

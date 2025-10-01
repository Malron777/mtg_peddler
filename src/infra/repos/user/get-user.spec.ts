import { userTestFactory } from "@/src/domain/auth/user.model.test-factory";
import { buildRunWithTestDb, migrateTestDb } from "@/test-db";
import { beforeAll, describe, expect, it } from "vitest";
import { DB } from "../../db/db";
import { getUserQuery } from "./get-user.query";

describe("getUserQuery", () => {
  let runWithTestDb: Awaited<ReturnType<typeof buildRunWithTestDb>>;

  beforeAll(async () => {
    await migrateTestDb();
    runWithTestDb = await buildRunWithTestDb();
  });

  it("should successfully retrieve an existing user", async () => {
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

      const result = await getUserQuery(db, user.id);

      expect(result.success).toBe(true);
      expect(result.user).toBeDefined();
      expect(result.user?.id).toBe(user.id);
      expect(result.user?.name).toBe("Test User");
      expect(result.user?.email).toBe("test@example.com");
      expect(result.user?.emailVerified).toBe(true);
      expect(result.user?.image).toBe("https://example.com/avatar.jpg");
      expect(result.user?.reputationScore).toBe("100");
      expect(result.user?.role).toBe("user");
      expect(result.user?.preferredCurrency).toBe("USD");
      expect(result.user?.notificationPreferences).toEqual({
        email: true,
        sms: false,
        push: true,
      });
      expect(result.error).toBeUndefined();
    });
  });

  it("should return error when user is not found", async () => {
    await runWithTestDb(async (db: DB) => {
      const nonExistentId = "non-existent-user-id";

      const result = await getUserQuery(db, nonExistentId);

      expect(result.success).toBe(false);
      expect(result.error).toBe("User not found");
      expect(result.user).toBeUndefined();
    });
  });

  it("should handle empty id gracefully", async () => {
    await runWithTestDb(async (db: DB) => {
      const result = await getUserQuery(db, "");

      expect(result.success).toBe(false);
      expect(result.error).toBe("User not found");
      expect(result.user).toBeUndefined();
    });
  });

  it("should handle null id gracefully", async () => {
    await runWithTestDb(async (db: DB) => {
      const result = await getUserQuery(db, null as unknown as string);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.user).toBeUndefined();
    });
  });

  it("should handle malformed id gracefully", async () => {
    await runWithTestDb(async (db: DB) => {
      const malformedId = "malformed-id-with-special-chars-!@#$%";

      const result = await getUserQuery(db, malformedId);

      expect(result.success).toBe(false);
      expect(result.error).toBe("User not found");
      expect(result.user).toBeUndefined();
    });
  });

  it("should retrieve an admin user", async () => {
    await runWithTestDb(async (db: DB) => {
      const user = await userTestFactory.insertOne(db, {
        id: "test-admin-user-id",
        name: "Admin User",
        email: "admin@example.com",
        emailVerified: true,
        image: "https://example.com/admin-avatar.jpg",
        reputationScore: "1000",
        role: "admin",
        preferredCurrency: "EUR",
        notificationPreferences: { email: true, sms: true, push: true },
      });

      const result = await getUserQuery(db, user.id);

      expect(result.success).toBe(true);
      expect(result.user).toBeDefined();
      expect(result.user?.role).toBe("admin");
      expect(result.user?.reputationScore).toBe("1000");
      expect(result.error).toBeUndefined();
    });
  });

  it("should retrieve a user with unverified email", async () => {
    await runWithTestDb(async (db: DB) => {
      const user = await userTestFactory.insertOne(db, {
        id: "test-unverified-user-id",
        name: "Unverified User",
        email: "unverified@example.com",
        emailVerified: false,
        image: null,
        reputationScore: "0",
        role: "user",
        preferredCurrency: "USD",
        notificationPreferences: { email: false, sms: false, push: false },
      });

      const result = await getUserQuery(db, user.id);

      expect(result.success).toBe(true);
      expect(result.user).toBeDefined();
      expect(result.user?.emailVerified).toBe(false);
      expect(result.user?.image).toBeNull();
      expect(result.user?.reputationScore).toBe("0");
      expect(result.error).toBeUndefined();
    });
  });
});

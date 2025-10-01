import { storesTestFactory } from "@/src/domain/auth/stores.model.test-factory";
import { buildRunWithTestDb, migrateTestDb } from "@/test-db";
import { beforeAll, describe, expect, it } from "vitest";
import { DB } from "../../db/db";
import { getStoreQuery } from "./get-store.query";

describe("getStoreQuery", () => {
  let runWithTestDb: Awaited<ReturnType<typeof buildRunWithTestDb>>;

  beforeAll(async () => {
    await migrateTestDb();
    runWithTestDb = await buildRunWithTestDb();
  });

  it("should successfully retrieve an existing store", async () => {
    await runWithTestDb(async (db: DB) => {
      const store = await storesTestFactory.insertOne(db, {
        id: "test-store-id-1",
        name: "Test Magic Store",
        websiteUrl: "https://testmagicstore.com",
        physicalAddress: "123 Magic Street, Test City",
        description: "A test store for Magic: The Gathering cards",
        isVerified: false,
        createdBy: "test-user-id-1",
      });

      const result = await getStoreQuery(db, store.id);

      expect(result.success).toBe(true);
      expect(result.store).toBeDefined();
      expect(result.store?.id).toBe(store.id);
      expect(result.store?.name).toBe("Test Magic Store");
      expect(result.store?.websiteUrl).toBe("https://testmagicstore.com");
      expect(result.store?.physicalAddress).toBe("123 Magic Street, Test City");
      expect(result.store?.description).toBe(
        "A test store for Magic: The Gathering cards"
      );
      expect(result.store?.isVerified).toBe(false);
      expect(result.store?.createdBy).toBe("test-user-id-1");
      expect(result.error).toBeUndefined();
    });
  });

  it("should return error when store is not found", async () => {
    await runWithTestDb(async (db: DB) => {
      const nonExistentId = "non-existent-store-id";

      const result = await getStoreQuery(db, nonExistentId);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Store not found");
      expect(result.store).toBeUndefined();
    });
  });

  it("should handle empty id gracefully", async () => {
    await runWithTestDb(async (db: DB) => {
      const result = await getStoreQuery(db, "");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Store not found");
      expect(result.store).toBeUndefined();
    });
  });

  it("should handle null id gracefully", async () => {
    await runWithTestDb(async (db: DB) => {
      const result = await getStoreQuery(db, null as unknown as string);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.store).toBeUndefined();
    });
  });

  it("should handle malformed id gracefully", async () => {
    await runWithTestDb(async (db: DB) => {
      const malformedId = "malformed-id-with-special-chars-!@#$%";

      const result = await getStoreQuery(db, malformedId);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Store not found");
      expect(result.store).toBeUndefined();
    });
  });

  it("should retrieve a verified store", async () => {
    await runWithTestDb(async (db: DB) => {
      const store = await storesTestFactory.insertOne(db, {
        id: "test-verified-store-id",
        name: "Verified Magic Store",
        websiteUrl: "https://verifiedmagicstore.com",
        physicalAddress: "456 Verified Street, Test City",
        description: "A verified store for Magic: The Gathering cards",
        isVerified: true,
        createdBy: "test-user-id-2",
      });

      const result = await getStoreQuery(db, store.id);

      expect(result.success).toBe(true);
      expect(result.store).toBeDefined();
      expect(result.store?.isVerified).toBe(true);
      expect(result.error).toBeUndefined();
    });
  });
});

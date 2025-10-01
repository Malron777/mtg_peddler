import { DB } from "@/src/infra/db/db";
import { stores } from "@/src/infra/db/schema/auth";
import { Store } from "./stores.model";

export const storesTestFactory = {
  buildOne(overrides: Partial<Store>): Store {
    return {
      ...overrides,
      id: crypto.randomUUID(),
      name: "Test Store",
      websiteUrl: "https://teststore.com",
      physicalAddress: "123 Test Street, Test City",
      description: "A test store for testing purposes",
      isVerified: false,
      createdBy: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  },

  async insertOne(db: DB, overrides: Partial<Store>): Promise<Store> {
    const store = this.buildOne(overrides);
    const result = await db.insert(stores).values(store).returning();
    return result[0];
  },

  async buildAndInsertOne(db: DB, overrides: Partial<Store>): Promise<Store> {
    const store = this.buildOne(overrides);
    const result = await db.insert(stores).values(store).returning();
    return result[0];
  },
};

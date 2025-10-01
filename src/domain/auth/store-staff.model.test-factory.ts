import { DB } from "@/src/infra/db/db";
import { storeStaff } from "@/src/infra/db/schema/auth";
import { StoreStaff } from "./store-staff.model";
import { storesTestFactory } from "./stores.model.test-factory";
import { userTestFactory } from "./user.model.test-factory";

export const storeStaffTestFactory = {
  buildOne(overrides: Partial<StoreStaff>): StoreStaff {
    return {
      storeId: crypto.randomUUID(),
      userId: crypto.randomUUID(),
      role: "staff",
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    };
  },

  async insertOne(db: DB, overrides: Partial<StoreStaff>): Promise<StoreStaff> {
    const staff = this.buildOne(overrides);
    const result = await db.insert(storeStaff).values(staff).returning();
    return result[0];
  },

  async buildAndInsertOne(
    db: DB,
    overrides: Partial<StoreStaff>
  ): Promise<StoreStaff> {
    const staff = this.buildOne(overrides);
    const result = await db.insert(storeStaff).values(staff).returning();
    return result[0];
  },

  async buildAndInsertOneWithDependencies(
    db: DB,
    overrides: Partial<StoreStaff>
  ): Promise<StoreStaff> {
    // Create dependencies if not provided
    const userId =
      overrides.userId || (await userTestFactory.buildAndInsertOne(db, {})).id;
    const storeId =
      overrides.storeId ||
      (await storesTestFactory.buildAndInsertOne(db, {})).id;

    // Build and insert with dependencies
    const staff = this.buildOne({
      ...overrides,
      userId,
      storeId,
    });
    const result = await db.insert(storeStaff).values(staff).returning();
    return result[0];
  },
};

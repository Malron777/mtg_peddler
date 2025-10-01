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
    return await this.insertOne(db, staff);
  },

  async buildAndInsertOneWithDependencies(
    db: DB,
    overrides: Partial<StoreStaff> = {}
  ): Promise<StoreStaff> {
    const user = await userTestFactory.buildAndInsertOne(db, {
      ...(overrides.userId ? { id: overrides.userId } : {}),
    });
    const store = await storesTestFactory.buildAndInsertOneWithDependencies(
      db,
      {
        ...(overrides.storeId ? { id: overrides.storeId } : {}),
      }
    );

    return await this.buildAndInsertOne(db, {
      ...overrides,
      userId: user.id,
      storeId: store.id,
    });
  },
};

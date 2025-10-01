import { DB } from "@/src/infra/db/db";
import { storeStaff } from "@/src/infra/db/schema/auth";
import { StoreStaff } from "./store-staff.model";

export function buildOne(overrides: Partial<StoreStaff>): StoreStaff {
  return {
    ...overrides,
    storeId: crypto.randomUUID(),
    userId: crypto.randomUUID(),
    role: "staff",
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

export async function insertOne(
  db: DB,
  overrides: Partial<StoreStaff>
): Promise<StoreStaff> {
  const staff = buildOne(overrides);
  const result = await db.insert(storeStaff).values(staff).returning();
  return result[0];
}

export async function buildAndInsertOne(
  db: DB,
  overrides: Partial<StoreStaff>
): Promise<StoreStaff> {
  const staff = buildOne(overrides);
  const result = await db.insert(storeStaff).values(staff).returning();
  return result[0];
}

export async function buildAndInsertOneWithDependencies(
  db: DB,
  overrides: Partial<StoreStaff>
): Promise<StoreStaff> {
  // Import the required factories
  const { buildAndInsertOne: buildUser } = await import(
    "./user.model.test-factory"
  );
  const { buildAndInsertOne: buildStore } = await import(
    "./stores.model.test-factory"
  );

  // Create dependencies if not provided
  const userId = overrides.userId || (await buildUser(db, {})).id;
  const storeId = overrides.storeId || (await buildStore(db, {})).id;

  // Build and insert with dependencies
  const staff = buildOne({
    ...overrides,
    userId,
    storeId,
  });
  const result = await db.insert(storeStaff).values(staff).returning();
  return result[0];
}

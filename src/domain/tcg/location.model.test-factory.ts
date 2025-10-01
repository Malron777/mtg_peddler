import { DB } from "@/src/infra/db/db";
import { locations } from "@/src/infra/db/schema/tcg";
import { Location } from "./location.model";

export function buildOne(overrides: Partial<Location>): Location {
  return {
    ...overrides,
    id: crypto.randomUUID(),
    userId: crypto.randomUUID(),
    type: "address",
    name: "Test Location",
    addressDetails: { street: "123 Test St", city: "Test City" },
    isPrimary: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

export async function insertOne(
  db: DB,
  overrides: Partial<Location>
): Promise<Location> {
  const location = buildOne(overrides);
  const result = await db.insert(locations).values(location).returning();
  return result[0];
}

export async function buildAndInsertOne(
  db: DB,
  overrides: Partial<Location>
): Promise<Location> {
  const location = buildOne(overrides);
  const result = await db.insert(locations).values(location).returning();
  return result[0];
}

export async function buildAndInsertOneWithDependencies(
  db: DB,
  overrides: Partial<Location>
): Promise<Location> {
  // Import the required factories
  const { buildAndInsertOne: buildUser } = await import(
    "../auth/user.model.test-factory"
  );

  // Create dependencies if not provided
  const userId = overrides.userId || (await buildUser(db, {})).id;

  // Build and insert with dependencies
  const location = buildOne({
    ...overrides,
    userId,
  });
  const result = await db.insert(locations).values(location).returning();
  return result[0];
}

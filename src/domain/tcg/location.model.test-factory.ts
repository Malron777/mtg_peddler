import { DB } from "@/src/infra/db/db";
import { locations } from "@/src/infra/db/schema/tcg";
import { userTestFactory } from "../auth/user.model.test-factory";
import { Location } from "./location.model";

export const locationTestFactory = {
  buildOne(overrides: Partial<Location>): Location {
    return {
      id: crypto.randomUUID(),
      userId: crypto.randomUUID(),
      type: "address",
      name: "Test Location",
      addressDetails: { street: "123 Test St", city: "Test City" },
      isPrimary: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    };
  },

  async insertOne(db: DB, overrides: Partial<Location>): Promise<Location> {
    const location = this.buildOne(overrides);
    const result = await db.insert(locations).values(location).returning();
    return result[0];
  },

  async buildAndInsertOne(
    db: DB,
    overrides: Partial<Location>
  ): Promise<Location> {
    const location = this.buildOne(overrides);
    const result = await db.insert(locations).values(location).returning();
    return result[0];
  },

  async buildAndInsertOneWithDependencies(
    db: DB,
    overrides: Partial<Location>
  ): Promise<Location> {
    // Create dependencies if not provided
    const userId =
      overrides.userId || (await userTestFactory.buildAndInsertOne(db, {})).id;

    // Build and insert with dependencies
    const location = this.buildOne({
      ...overrides,
      userId,
    });
    const result = await db.insert(locations).values(location).returning();
    return result[0];
  },
};

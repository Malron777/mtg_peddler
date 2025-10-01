import { DB } from "@/src/infra/db/db";
import { wantLists } from "@/src/infra/db/schema/tcg";
import { userTestFactory } from "../auth/user.model.test-factory";
import { WantList } from "./want-list.model";

export const wantListTestFactory = {
  buildOne(overrides: Partial<WantList>): WantList {
    return {
      ...overrides,
      id: crypto.randomUUID(),
      userId: crypto.randomUUID(),
      name: "Test Want List",
      description: "A test want list for testing purposes",
      priority: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  },

  async insertOne(db: DB, overrides: Partial<WantList>): Promise<WantList> {
    const wantList = this.buildOne(overrides);
    const result = await db.insert(wantLists).values(wantList).returning();
    return result[0];
  },

  async buildAndInsertOne(
    db: DB,
    overrides: Partial<WantList>
  ): Promise<WantList> {
    const wantList = this.buildOne(overrides);
    const result = await db.insert(wantLists).values(wantList).returning();
    return result[0];
  },

  async buildAndInsertOneWithDependencies(
    db: DB,
    overrides: Partial<WantList>
  ): Promise<WantList> {
    // Create dependencies if not provided
    const userId =
      overrides.userId || (await userTestFactory.buildAndInsertOne(db, {})).id;

    // Build and insert with dependencies
    const wantList = this.buildOne({
      ...overrides,
      userId,
    });
    const result = await db.insert(wantLists).values(wantList).returning();
    return result[0];
  },
};

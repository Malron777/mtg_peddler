import { DB } from "@/src/infra/db/db";
import { user } from "@/src/infra/db/schema/auth";
import { User } from "./user.model";

export const userTestFactory = {
  buildOne(overrides: Partial<User>): User {
    const id = crypto.randomUUID();
    return {
      id: id,
      name: "Test User",
      email: `${id}@email.com`,
      emailVerified: true,
      image: "Test Image",
      reputationScore: "Test Reputation Score",
      role: "admin",
      preferredCurrency: "Test Preferred Currency",
      notificationPreferences: { email: true, sms: true, push: true },
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    };
  },

  async insertOne(db: DB, u: User): Promise<User> {
    const result = await db.insert(user).values(u).returning();
    return result[0];
  },

  async buildAndInsertOne(
    db: DB,
    overrides: Partial<User> = {}
  ): Promise<User> {
    const user = this.buildOne(overrides);
    return await this.insertOne(db, user);
  },
};

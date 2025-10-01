import { DB } from "@/src/infra/db/db";
import { user } from "@/src/infra/db/schema/auth";
import { User } from "./user.model";

export const userTestFactory = {
  buildOne(overrides: Partial<User>): User {
    return {
      id: crypto.randomUUID(),
      name: "Test User",
      email: "test@email.com",
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

  async insertOne(db: DB, overrides: Partial<User>): Promise<User> {
    const u = this.buildOne(overrides);
    const result = await db.insert(user).values(u).returning();
    return result[0];
  },

  async buildAndInsertOne(db: DB, overrides: Partial<User>): Promise<User> {
    const u = this.buildOne(overrides);
    const result = await db.insert(user).values(u).returning();
    return result[0];
  },
};

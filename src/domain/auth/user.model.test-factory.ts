import { DB } from "@/src/infra/db/db";
import { user } from "@/src/infra/db/schema/auth";
import { User } from "./user.model";

export function buildOne(overrides: Partial<User>): User {
  return {
    ...overrides,
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
  };
}

export async function insertOne(
  db: DB,
  overrides: Partial<User>
): Promise<User> {
  const u = buildOne(overrides);
  const result = await db.insert(user).values(u).returning();
  return result[0];
}

export async function buildAndInsertOne(
  db: DB,
  overrides: Partial<User>
): Promise<User> {
  const u = buildOne(overrides);
  const result = await db.insert(user).values(u).returning();
  return result[0];
}

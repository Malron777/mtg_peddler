import { DB } from "@/src/infra/db/db";
import { paymentMethods } from "@/src/infra/db/schema/tcg";
import { PaymentMethod } from "./payment-method.model";

export function buildOne(overrides: Partial<PaymentMethod>): PaymentMethod {
  return {
    ...overrides,
    id: crypto.randomUUID(),
    userId: crypto.randomUUID(),
    type: "bank_transfer",
    details: { accountNumber: "123456789", bankName: "Test Bank" },
    isPrimary: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

export async function insertOne(
  db: DB,
  overrides: Partial<PaymentMethod>
): Promise<PaymentMethod> {
  const paymentMethod = buildOne(overrides);
  const result = await db
    .insert(paymentMethods)
    .values(paymentMethod)
    .returning();
  return result[0];
}

export async function buildAndInsertOne(
  db: DB,
  overrides: Partial<PaymentMethod>
): Promise<PaymentMethod> {
  const paymentMethod = buildOne(overrides);
  const result = await db
    .insert(paymentMethods)
    .values(paymentMethod)
    .returning();
  return result[0];
}

export async function buildAndInsertOneWithDependencies(
  db: DB,
  overrides: Partial<PaymentMethod>
): Promise<PaymentMethod> {
  // Import the required factories
  const { buildAndInsertOne: buildUser } = await import(
    "../auth/user.model.test-factory"
  );

  // Create dependencies if not provided
  const userId = overrides.userId || (await buildUser(db, {})).id;

  // Build and insert with dependencies
  const paymentMethod = buildOne({
    ...overrides,
    userId,
  });
  const result = await db
    .insert(paymentMethods)
    .values(paymentMethod)
    .returning();
  return result[0];
}

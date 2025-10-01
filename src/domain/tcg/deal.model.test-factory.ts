import { DB } from "@/src/infra/db/db";
import { deals } from "@/src/infra/db/schema/tcg";
import { Deal } from "./deal.model";

export function buildOne(overrides: Partial<Deal>): Deal {
  return {
    ...overrides,
    id: crypto.randomUUID(),
    sellerId: crypto.randomUUID(),
    buyerId: crypto.randomUUID(),
    status: "negotiating",
    totalAmount: "100.00",
    paymentMethodId: crypto.randomUUID(),
    shippingLocationId: crypto.randomUUID(),
    createdAt: new Date(),
    finalizedAt: null,
    updatedAt: new Date(),
  };
}

export async function insertOne(
  db: DB,
  overrides: Partial<Deal>
): Promise<Deal> {
  const deal = buildOne(overrides);
  const result = await db.insert(deals).values(deal).returning();
  return result[0];
}

export async function buildAndInsertOne(
  db: DB,
  overrides: Partial<Deal>
): Promise<Deal> {
  const deal = buildOne(overrides);
  const result = await db.insert(deals).values(deal).returning();
  return result[0];
}

export async function buildAndInsertOneWithDependencies(
  db: DB,
  overrides: Partial<Deal>
): Promise<Deal> {
  // Import the required factories
  const { buildAndInsertOne: buildUser } = await import(
    "../auth/user.model.test-factory"
  );
  const { buildAndInsertOne: buildPaymentMethod } = await import(
    "./payment-method.model.test-factory"
  );
  const { buildAndInsertOne: buildLocation } = await import(
    "./location.model.test-factory"
  );

  // Create dependencies if not provided
  const sellerId = overrides.sellerId || (await buildUser(db, {})).id;
  const buyerId = overrides.buyerId || (await buildUser(db, {})).id;

  // Optional dependencies
  const paymentMethodId =
    overrides.paymentMethodId ||
    (await buildPaymentMethod(db, { userId: buyerId })).id;
  const shippingLocationId =
    overrides.shippingLocationId ||
    (await buildLocation(db, { userId: buyerId })).id;

  // Build and insert with dependencies
  const deal = buildOne({
    ...overrides,
    sellerId,
    buyerId,
    paymentMethodId,
    shippingLocationId,
  });
  const result = await db.insert(deals).values(deal).returning();
  return result[0];
}

import { DB } from "@/src/infra/db/db";
import { deals } from "@/src/infra/db/schema/tcg";
import { userTestFactory } from "../auth/user.model.test-factory";
import { Deal } from "./deal.model";
import { locationTestFactory } from "./location.model.test-factory";
import { paymentMethodTestFactory } from "./payment-method.model.test-factory";

export const dealTestFactory = {
  buildOne(overrides: Partial<Deal>): Deal {
    return {
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
      ...overrides,
    };
  },

  async insertOne(db: DB, overrides: Partial<Deal>): Promise<Deal> {
    const deal = this.buildOne(overrides);
    const result = await db.insert(deals).values(deal).returning();
    return result[0];
  },

  async buildAndInsertOne(db: DB, overrides: Partial<Deal>): Promise<Deal> {
    const deal = this.buildOne(overrides);
    const result = await db.insert(deals).values(deal).returning();
    return result[0];
  },

  async buildAndInsertOneWithDependencies(
    db: DB,
    overrides: Partial<Deal>
  ): Promise<Deal> {
    // Create dependencies if not provided
    const sellerId =
      overrides.sellerId ||
      (await userTestFactory.buildAndInsertOne(db, {})).id;
    const buyerId =
      overrides.buyerId || (await userTestFactory.buildAndInsertOne(db, {})).id;

    // Optional dependencies
    const paymentMethodId =
      overrides.paymentMethodId ||
      (
        await paymentMethodTestFactory.buildAndInsertOne(db, {
          userId: buyerId,
        })
      ).id;
    const shippingLocationId =
      overrides.shippingLocationId ||
      (await locationTestFactory.buildAndInsertOne(db, { userId: buyerId })).id;

    // Build and insert with dependencies
    const deal = this.buildOne({
      ...overrides,
      sellerId,
      buyerId,
      paymentMethodId,
      shippingLocationId,
    });
    const result = await db.insert(deals).values(deal).returning();
    return result[0];
  },
};

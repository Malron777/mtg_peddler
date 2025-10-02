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
      paymentMethodId: null,
      shippingLocationId: null,
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
    const seller = await userTestFactory.buildAndInsertOne(db, {
      ...(overrides.sellerId ? { id: overrides.sellerId } : {}),
    });
    const buyer = await userTestFactory.buildAndInsertOne(db, {
      ...(overrides.buyerId ? { id: overrides.buyerId } : {}),
    });

    // Optional dependencies - only create if not provided
    const paymentMethod = overrides.paymentMethodId
      ? await paymentMethodTestFactory.buildAndInsertOne(db, {
          userId: buyer.id,
          id: overrides.paymentMethodId,
        })
      : null;

    const location = overrides.shippingLocationId
      ? await locationTestFactory.buildAndInsertOne(db, {
          userId: buyer.id,
          ...(overrides.shippingLocationId
            ? { id: overrides.shippingLocationId }
            : {}),
        })
      : null;

    // Build and insert with dependencies
    const deal = this.buildOne({
      ...overrides,
      sellerId: seller.id,
      buyerId: buyer.id,
      paymentMethodId: paymentMethod ? paymentMethod.id : null,
      shippingLocationId: location ? location.id : null,
    });
    const result = await db.insert(deals).values(deal).returning();
    return result[0];
  },
};

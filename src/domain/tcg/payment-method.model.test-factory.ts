import { DB } from "@/src/infra/db/db";
import { paymentMethods } from "@/src/infra/db/schema/tcg";
import { userTestFactory } from "../auth/user.model.test-factory";
import { PaymentMethod } from "./payment-method.model";

export const paymentMethodTestFactory = {
  buildOne(overrides: Partial<PaymentMethod>): PaymentMethod {
    return {
      id: crypto.randomUUID(),
      userId: crypto.randomUUID(),
      type: "bank_transfer",
      details: { accountNumber: "123456789", bankName: "Test Bank" },
      isPrimary: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    };
  },

  async insertOne(
    db: DB,
    overrides: Partial<PaymentMethod>
  ): Promise<PaymentMethod> {
    const paymentMethod = this.buildOne(overrides);
    const result = await db
      .insert(paymentMethods)
      .values(paymentMethod)
      .returning();
    return result[0];
  },

  async buildAndInsertOne(
    db: DB,
    overrides: Partial<PaymentMethod>
  ): Promise<PaymentMethod> {
    const paymentMethod = this.buildOne(overrides);
    const result = await db
      .insert(paymentMethods)
      .values(paymentMethod)
      .returning();
    return result[0];
  },

  async buildAndInsertOneWithDependencies(
    db: DB,
    overrides: Partial<PaymentMethod>
  ): Promise<PaymentMethod> {
    // Create dependencies if not provided
    const userId =
      overrides.userId || (await userTestFactory.buildAndInsertOne(db, {})).id;

    // Build and insert with dependencies
    const paymentMethod = this.buildOne({
      ...overrides,
      userId,
    });
    const result = await db
      .insert(paymentMethods)
      .values(paymentMethod)
      .returning();
    return result[0];
  },
};

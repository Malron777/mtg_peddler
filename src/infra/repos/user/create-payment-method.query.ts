import {
  InsertPaymentMethod,
  PaymentMethod,
} from "@/src/domain/tcg/payment-method.model";
import { DB } from "@/src/infra/db/db";
import { paymentMethods } from "@/src/infra/db/schema";

export interface CreatePaymentMethodResult {
  success: boolean;
  paymentMethod?: PaymentMethod;
  error?: string;
}

export async function createPaymentMethodQuery(
  db: DB,
  insertPaymentMethod: InsertPaymentMethod
): Promise<CreatePaymentMethodResult> {
  try {
    const result = await db
      .insert(paymentMethods)
      .values(insertPaymentMethod)
      .returning();

    return {
      success: true,
      paymentMethod: result[0],
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

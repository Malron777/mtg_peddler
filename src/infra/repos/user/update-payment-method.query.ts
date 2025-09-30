import {
  PaymentMethod,
  UpdatePaymentMethod,
} from "@/src/domain/tcg/payment-method.model";
import { DB } from "@/src/infra/db/db";
import { paymentMethods } from "@/src/infra/db/schema";
import { eq } from "drizzle-orm";

export async function updatePaymentMethodQuery(
  db: DB,
  updatePaymentMethod: UpdatePaymentMethod
): Promise<PaymentMethod> {
  const result = await db
    .update(paymentMethods)
    .set({
      ...updatePaymentMethod,
      updatedAt: new Date(),
    })
    .where(eq(paymentMethods.id, updatePaymentMethod.id))
    .returning();

  return result[0];
}

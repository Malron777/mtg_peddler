import { PaymentMethod } from "@/src/domain/tcg/payment-method.model";
import { DB } from "@/src/infra/db/db";
import { paymentMethods } from "@/src/infra/db/schema";
import { eq } from "drizzle-orm";

export interface GetPaymentMethodResult {
  success: boolean;
  paymentMethod?: PaymentMethod;
  error?: string;
}

export async function getPaymentMethodQuery(
  db: DB,
  id: string
): Promise<GetPaymentMethodResult> {
  try {
    const result = await db.query.paymentMethods.findFirst({
      where: eq(paymentMethods.id, id),
    });

    if (result) {
      return {
        success: true,
        paymentMethod: result,
      };
    } else {
      return {
        success: false,
        error: "Payment method not found",
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

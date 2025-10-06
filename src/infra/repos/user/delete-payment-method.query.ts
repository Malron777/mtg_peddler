import { DB } from "@/src/infra/db/db";
import { paymentMethods } from "@/src/infra/db/schema";
import { eq } from "drizzle-orm";

export interface DeletePaymentMethodResult {
  success: boolean;
  error?: string;
}

export async function deletePaymentMethodQuery(
  db: DB,
  id: string
): Promise<DeletePaymentMethodResult> {
  try {
    await db.delete(paymentMethods).where(eq(paymentMethods.id, id));

    return {
      success: true,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

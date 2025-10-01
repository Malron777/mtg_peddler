import { PaymentMethod } from "@/src/domain/tcg/payment-method.model";
import { DB } from "@/src/infra/db/db";
import { paymentMethods } from "@/src/infra/db/schema";
import { desc, eq, sql } from "drizzle-orm";

export interface GetAllPaymentMethodsForUserOptions {
  page?: number;
  pageSize?: number;
}

export interface GetAllPaymentMethodsForUserResult {
  paymentMethods: PaymentMethod[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export async function getAllPaymentMethodsForUserQuery(
  db: DB,
  userId: string,
  options: GetAllPaymentMethodsForUserOptions = {}
): Promise<GetAllPaymentMethodsForUserResult> {
  const page = options.page ?? 1;
  const pageSize = options.pageSize ?? 50;
  const offset = (page - 1) * pageSize;

  // Get total count
  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(paymentMethods)
    .where(eq(paymentMethods.userId, userId));

  const totalCount = Number(countResult[0]?.count ?? 0);

  // Get paginated payment methods
  const paymentMethodsResult = await db
    .select()
    .from(paymentMethods)
    .where(eq(paymentMethods.userId, userId))
    .orderBy(desc(paymentMethods.createdAt))
    .limit(pageSize)
    .offset(offset);

  const totalPages = Math.ceil(totalCount / pageSize);

  return {
    paymentMethods: paymentMethodsResult,
    totalCount,
    page,
    pageSize,
    totalPages,
  };
}

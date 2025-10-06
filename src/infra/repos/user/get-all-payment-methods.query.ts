import { PaymentMethod } from "@/src/domain/tcg/payment-method.model";
import { DB } from "@/src/infra/db/db";
import { paymentMethods } from "@/src/infra/db/schema";
import { desc, sql } from "drizzle-orm";

export interface GetAllPaymentMethodsOptions {
  page?: number;
  pageSize?: number;
}

export interface GetAllPaymentMethodsResult {
  paymentMethods: PaymentMethod[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export async function getAllPaymentMethodsQuery(
  db: DB,
  options: GetAllPaymentMethodsOptions = {}
): Promise<GetAllPaymentMethodsResult> {
  const page = options.page ?? 1;
  const pageSize = options.pageSize ?? 50;
  const offset = (page - 1) * pageSize;

  // Get total count
  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(paymentMethods);

  const totalCount = Number(countResult[0]?.count ?? 0);

  // Get paginated payment methods
  const paymentMethodsResult = await db
    .select()
    .from(paymentMethods)
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

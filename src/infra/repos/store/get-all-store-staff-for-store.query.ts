import { StoreStaff } from "@/src/domain/auth/store-staff.model";
import { DB } from "@/src/infra/db/db";
import { storeStaff } from "@/src/infra/db/schema";
import { desc, eq, sql } from "drizzle-orm";

export interface GetAllStoreStaffForStoreOptions {
  page?: number;
  pageSize?: number;
}

export interface GetAllStoreStaffForStoreResult {
  storeStaff: StoreStaff[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export async function getAllStoreStaffForStoreQuery(
  db: DB,
  storeId: string,
  options: GetAllStoreStaffForStoreOptions = {}
): Promise<GetAllStoreStaffForStoreResult> {
  const page = options.page ?? 1;
  const pageSize = options.pageSize ?? 50;
  const offset = (page - 1) * pageSize;

  // Get total count
  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(storeStaff)
    .where(eq(storeStaff.storeId, storeId));

  const totalCount = Number(countResult[0]?.count ?? 0);

  // Get paginated store staff
  const storeStaffResult = await db
    .select()
    .from(storeStaff)
    .where(eq(storeStaff.storeId, storeId))
    .orderBy(desc(storeStaff.createdAt))
    .limit(pageSize)
    .offset(offset);

  const totalPages = Math.ceil(totalCount / pageSize);

  return {
    storeStaff: storeStaffResult,
    totalCount,
    page,
    pageSize,
    totalPages,
  };
}

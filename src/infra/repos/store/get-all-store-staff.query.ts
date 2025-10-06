import { StoreStaff } from "@/src/domain/auth/store-staff.model";
import { DB } from "@/src/infra/db/db";
import { storeStaff } from "@/src/infra/db/schema";
import { desc, sql } from "drizzle-orm";

export interface GetAllStoreStaffOptions {
  page?: number;
  pageSize?: number;
}

export interface GetAllStoreStaffResult {
  storeStaff: StoreStaff[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export async function getAllStoreStaffQuery(
  db: DB,
  options: GetAllStoreStaffOptions = {}
): Promise<GetAllStoreStaffResult> {
  const page = options.page ?? 1;
  const pageSize = options.pageSize ?? 50;
  const offset = (page - 1) * pageSize;

  // Get total count
  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(storeStaff);

  const totalCount = Number(countResult[0]?.count ?? 0);

  // Get paginated store staff
  const storeStaffResult = await db
    .select()
    .from(storeStaff)
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

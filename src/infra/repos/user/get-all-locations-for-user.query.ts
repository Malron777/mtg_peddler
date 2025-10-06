import { Location } from "@/src/domain/tcg/location.model";
import { DB } from "@/src/infra/db/db";
import { locations } from "@/src/infra/db/schema";
import { desc, eq, sql } from "drizzle-orm";

export interface GetAllLocationsForUserOptions {
  page?: number;
  pageSize?: number;
}

export interface GetAllLocationsForUserResult {
  locations: Location[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export async function getAllLocationsForUserQuery(
  db: DB,
  userId: string,
  options: GetAllLocationsForUserOptions = {}
): Promise<GetAllLocationsForUserResult> {
  const page = options.page ?? 1;
  const pageSize = options.pageSize ?? 50;
  const offset = (page - 1) * pageSize;

  // Get total count
  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(locations)
    .where(eq(locations.userId, userId));

  const totalCount = Number(countResult[0]?.count ?? 0);

  // Get paginated locations
  const locationsResult = await db
    .select()
    .from(locations)
    .where(eq(locations.userId, userId))
    .orderBy(desc(locations.createdAt))
    .limit(pageSize)
    .offset(offset);

  const totalPages = Math.ceil(totalCount / pageSize);

  return {
    locations: locationsResult,
    totalCount,
    page,
    pageSize,
    totalPages,
  };
}

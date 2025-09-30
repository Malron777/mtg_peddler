import { Location } from "@/src/domain/tcg/location.model";
import { DB } from "@/src/infra/db/db";
import { locations } from "@/src/infra/db/schema";
import { desc, sql } from "drizzle-orm";

export interface GetAllLocationsOptions {
  page?: number;
  pageSize?: number;
}

export interface GetAllLocationsResult {
  locations: Location[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export async function getAllLocationsQuery(
  db: DB,
  options: GetAllLocationsOptions = {}
): Promise<GetAllLocationsResult> {
  const page = options.page ?? 1;
  const pageSize = options.pageSize ?? 50;
  const offset = (page - 1) * pageSize;

  // Get total count
  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(locations);

  const totalCount = countResult[0]?.count ?? 0;

  // Get paginated locations
  const locationsResult = await db
    .select()
    .from(locations)
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

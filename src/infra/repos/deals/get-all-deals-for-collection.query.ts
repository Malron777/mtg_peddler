import { Deal } from "@/src/domain/tcg/deal.model";
import { DB } from "@/src/infra/db/db";
import { collectionItems, dealItems, deals } from "@/src/infra/db/schema";
import { desc, eq, inArray, sql } from "drizzle-orm";

export interface GetAllDealsForCollectionOptions {
  page?: number;
  pageSize?: number;
}

export interface GetAllDealsForCollectionResult {
  deals: Deal[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export async function getAllDealsForCollectionQuery(
  db: DB,
  collectionId: string,
  options: GetAllDealsForCollectionOptions = {}
): Promise<GetAllDealsForCollectionResult> {
  const page = options.page ?? 1;
  const pageSize = options.pageSize ?? 50;
  const offset = (page - 1) * pageSize;

  if (collectionId === "") {
    return {
      deals: [],
      totalCount: 0,
      page: 1,
      pageSize: 50,
      totalPages: 0,
    };
  }

  // Get total count
  const countResult = await db
    .select({ count: sql<number>`count(distinct ${deals.id})` })
    .from(deals)
    .innerJoin(dealItems, eq(deals.id, dealItems.dealId))
    .innerJoin(
      collectionItems,
      eq(dealItems.collectionItemId, collectionItems.id)
    )
    .where(eq(collectionItems.collectionId, collectionId));

  const totalCount = Number(countResult[0]?.count ?? 0);

  // Get paginated deals
  const dealsResult = await db
    .selectDistinct()
    .from(deals)
    .innerJoin(dealItems, eq(deals.id, dealItems.dealId))
    .innerJoin(
      collectionItems,
      eq(dealItems.collectionItemId, collectionItems.id)
    )
    .where(eq(collectionItems.collectionId, collectionId))
    .orderBy(desc(deals.createdAt))
    .limit(pageSize)
    .offset(offset);

  // Get full deal details for the distinct deals
  const dealIds = dealsResult.map((d) => d.deals.id);
  const fullDeals = await db.query.deals.findMany({
    where: inArray(deals.id, dealIds),
    orderBy: desc(deals.createdAt),
  });

  const totalPages = Math.ceil(totalCount / pageSize);

  return {
    deals: fullDeals,
    totalCount,
    page,
    pageSize,
    totalPages,
  };
}

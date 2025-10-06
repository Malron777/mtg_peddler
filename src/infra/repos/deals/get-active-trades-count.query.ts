import { DB } from "@/src/infra/db/db";
import { deals } from "@/src/infra/db/schema";
import { and, inArray, sql } from "drizzle-orm";

export interface GetActiveTradesCountOptions {
  userId?: string;
  userIds?: string[];
}

export interface GetActiveTradesCountResult {
  count: number;
  userId?: string;
}

export async function getActiveTradesCountQuery(
  db: DB,
  options: GetActiveTradesCountOptions = {}
): Promise<GetActiveTradesCountResult[]> {
  const { userId, userIds } = options;

  // Active deal statuses (not completed, rejected, expired, or disputed)
  const activeStatuses = [
    "negotiating",
    "accepted",
    "payment_pending",
    "shipped",
  ] as const;

  // If no userId or userIds provided, return count for all users
  if (!userId && !userIds) {
    const totalResult = await db.query.deals.findMany({
      where: inArray(deals.status, activeStatuses),
      columns: {
        id: true,
      },
    });

    return [{ count: totalResult.length }];
  }

  // If userIds is provided, get counts for multiple users
  if (userIds && userIds.length > 0) {
    const result = await db.query.deals.findMany({
      where: and(
        inArray(deals.status, activeStatuses),
        sql`(${deals.sellerId} IN (${sql.join(
          userIds.map((id) => sql`${id}`),
          sql`, `
        )}) OR ${deals.buyerId} IN (${sql.join(
          userIds.map((id) => sql`${id}`),
          sql`, `
        )}))`
      ),
      columns: {
        sellerId: true,
        buyerId: true,
      },
    });

    // Group by user and count
    const userCounts = new Map<string, number>();

    for (const deal of result) {
      // Count as seller
      if (userIds.includes(deal.sellerId)) {
        userCounts.set(deal.sellerId, (userCounts.get(deal.sellerId) || 0) + 1);
      }
      // Count as buyer
      if (userIds.includes(deal.buyerId)) {
        userCounts.set(deal.buyerId, (userCounts.get(deal.buyerId) || 0) + 1);
      }
    }

    return Array.from(userCounts.entries()).map(([userId, count]) => ({
      count,
      userId,
    }));
  }

  // Single user case
  if (userId) {
    const result = await db.query.deals.findMany({
      where: and(
        inArray(deals.status, activeStatuses),
        sql`(${deals.sellerId} = ${userId} OR ${deals.buyerId} = ${userId})`
      ),
      columns: {
        sellerId: true,
        buyerId: true,
      },
    });

    const count = result.length;
    return [{ count, userId }];
  }

  return [];
}

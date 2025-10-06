import { Message } from "@/src/domain/tcg/message.model";
import { DB } from "@/src/infra/db/db";
import { messages } from "@/src/infra/db/schema";
import { desc, eq, sql } from "drizzle-orm";

export interface GetAllMessagesForDealOptions {
  page?: number;
  pageSize?: number;
}

export interface GetAllMessagesForDealResult {
  messages: Message[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export async function getAllMessagesForDealQuery(
  db: DB,
  dealId: string,
  options: GetAllMessagesForDealOptions = {}
): Promise<GetAllMessagesForDealResult> {
  const page = options.page ?? 1;
  const pageSize = options.pageSize ?? 50;
  const offset = (page - 1) * pageSize;

  // Get total count
  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(messages)
    .where(eq(messages.dealId, dealId));

  const totalCount = Number(countResult[0]?.count ?? 0);

  // Get paginated messages
  const messagesResult = await db
    .select()
    .from(messages)
    .where(eq(messages.dealId, dealId))
    .orderBy(desc(messages.createdAt))
    .limit(pageSize)
    .offset(offset);

  const totalPages = Math.ceil(totalCount / pageSize);

  return {
    messages: messagesResult,
    totalCount,
    page,
    pageSize,
    totalPages,
  };
}

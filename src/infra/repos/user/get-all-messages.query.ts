import { Message } from "@/src/domain/tcg/message.model";
import { DB } from "@/src/infra/db/db";
import { messages } from "@/src/infra/db/schema";
import { desc, sql } from "drizzle-orm";

export interface GetAllMessagesOptions {
  page?: number;
  pageSize?: number;
}

export interface GetAllMessagesResult {
  messages: Message[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export async function getAllMessagesQuery(
  db: DB,
  options: GetAllMessagesOptions = {}
): Promise<GetAllMessagesResult> {
  const page = options.page ?? 1;
  const pageSize = options.pageSize ?? 50;
  const offset = (page - 1) * pageSize;

  // Get total count
  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(messages);

  const totalCount = Number(countResult[0]?.count ?? 0);

  // Get paginated messages
  const messagesResult = await db
    .select()
    .from(messages)
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

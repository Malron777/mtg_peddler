import { Message } from "@/src/domain/tcg/message.model";
import { DB } from "@/src/infra/db/db";
import { messages } from "@/src/infra/db/schema";
import { and, desc, eq, or, sql } from "drizzle-orm";

export interface GetAllMessagesForUserPairOptions {
  page?: number;
  pageSize?: number;
}

export interface GetAllMessagesForUserPairResult {
  messages: Message[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export async function getAllMessagesForUserPairQuery(
  db: DB,
  userId1: string,
  userId2: string,
  options: GetAllMessagesForUserPairOptions = {}
): Promise<GetAllMessagesForUserPairResult> {
  const page = options.page ?? 1;
  const pageSize = options.pageSize ?? 50;
  const offset = (page - 1) * pageSize;

  // Get total count
  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(messages)
    .where(
      or(
        and(eq(messages.senderId, userId1), eq(messages.recipientId, userId2)),
        and(eq(messages.senderId, userId2), eq(messages.recipientId, userId1))
      )
    );

  const totalCount = countResult[0]?.count ?? 0;

  // Get paginated messages
  const messagesResult = await db
    .select()
    .from(messages)
    .where(
      or(
        and(eq(messages.senderId, userId1), eq(messages.recipientId, userId2)),
        and(eq(messages.senderId, userId2), eq(messages.recipientId, userId1))
      )
    )
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

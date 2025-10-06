import { InsertMessage, Message } from "@/src/domain/tcg/message.model";
import { DB } from "@/src/infra/db/db";
import { messages } from "@/src/infra/db/schema";

export interface CreateMessageResult {
  success: boolean;
  message?: Message;
  error?: string;
}

export async function createMessageQuery(
  db: DB,
  insertMessage: InsertMessage
): Promise<CreateMessageResult> {
  try {
    const result = await db.insert(messages).values(insertMessage).returning();

    return {
      success: true,
      message: result[0],
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

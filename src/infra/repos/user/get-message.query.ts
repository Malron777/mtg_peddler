import { Message } from "@/src/domain/tcg/message.model";
import { DB } from "@/src/infra/db/db";
import { messages } from "@/src/infra/db/schema";
import { eq } from "drizzle-orm";

export interface GetMessageResult {
  success: boolean;
  message?: Message;
  error?: string;
}

export async function getMessageQuery(
  db: DB,
  id: string
): Promise<GetMessageResult> {
  try {
    const result = await db.query.messages.findFirst({
      where: eq(messages.id, id),
    });

    if (result) {
      return {
        success: true,
        message: result,
      };
    } else {
      return {
        success: false,
        error: "Message not found",
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

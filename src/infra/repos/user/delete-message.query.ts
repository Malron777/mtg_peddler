import { DB } from "@/src/infra/db/db";
import { messages } from "@/src/infra/db/schema";
import { eq } from "drizzle-orm";

export interface DeleteMessageResult {
  success: boolean;
  error?: string;
}

export async function deleteMessageQuery(
  db: DB,
  id: string
): Promise<DeleteMessageResult> {
  try {
    await db.delete(messages).where(eq(messages.id, id));

    return {
      success: true,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

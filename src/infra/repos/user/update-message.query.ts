import { Message, UpdateMessage } from "@/src/domain/tcg/message.model";
import { DB } from "@/src/infra/db/db";
import { messages } from "@/src/infra/db/schema";
import { eq } from "drizzle-orm";
import { filterUndefined } from "../utils";

export async function updateMessageQuery(
  db: DB,
  updateMessage: UpdateMessage
): Promise<Message> {
  const result = await db
    .update(messages)
    .set({
      ...filterUndefined(updateMessage),
      updatedAt: new Date(),
    })
    .where(eq(messages.id, updateMessage.id))
    .returning();

  return result[0];
}

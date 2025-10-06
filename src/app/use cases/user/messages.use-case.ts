import { InsertMessage, UpdateMessage } from "@/src/domain/tcg/message.model";
import { DB } from "@/src/infra/db/db";
import { createMessageQuery } from "@/src/infra/repos/user/create-message.query";
import { deleteMessageQuery } from "@/src/infra/repos/user/delete-message.query";
import { getAllMessagesForDealQuery } from "@/src/infra/repos/user/get-all-messages-for-deal.query";
import { getAllMessagesForUserPairQuery } from "@/src/infra/repos/user/get-all-messages-for-user-pair.query";
import { getAllMessagesQuery } from "@/src/infra/repos/user/get-all-messages.query";
import { getMessageQuery } from "@/src/infra/repos/user/get-message.query";
import { updateMessageQuery } from "@/src/infra/repos/user/update-message.query";

export class MessagesUseCase {
  private readonly db: DB;

  constructor(db: DB) {
    this.db = db;
  }

  async createMessage(insertMessage: InsertMessage) {
    return createMessageQuery(this.db, insertMessage);
  }

  async getMessage(messageId: string) {
    return getMessageQuery(this.db, messageId);
  }

  async getAllMessages() {
    return getAllMessagesQuery(this.db);
  }

  async getAllMessagesForDeal(dealId: string) {
    return getAllMessagesForDealQuery(this.db, dealId);
  }

  async getAllMessagesForUserPair(userId1: string, userId2: string) {
    return getAllMessagesForUserPairQuery(this.db, userId1, userId2);
  }

  async updateMessage(updateData: UpdateMessage) {
    return updateMessageQuery(this.db, updateData);
  }

  async deleteMessage(messageId: string) {
    return deleteMessageQuery(this.db, messageId);
  }
}

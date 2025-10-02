import { InsertCard, UpdateCard } from "@/src/domain/tcg/card.model";
import { DB } from "@/src/infra/db/db";
import { createCardQuery } from "@/src/infra/repos/card/create-card.query";
import { deleteCardQuery } from "@/src/infra/repos/card/delete-card.query";
import { getAllCardsForCollectionQuery } from "@/src/infra/repos/card/get-all-cards-for-collection.query";
import { getAllCardsQuery } from "@/src/infra/repos/card/get-all-cards.query";
import { getCardByIdQuery } from "@/src/infra/repos/card/get-card-by-id.query";
import { getCardQuery } from "@/src/infra/repos/card/get-card.query";
import { updateCardQuery } from "@/src/infra/repos/card/update-card.query";

export class CardsUseCase {
  private readonly db: DB;

  constructor(db: DB) {
    this.db = db;
  }

  async createCard(insertCard: InsertCard) {
    return createCardQuery(this.db, insertCard);
  }

  async getCard(scryfallId: string) {
    return getCardQuery(this.db, scryfallId);
  }

  async getCardById(cardId: string) {
    return getCardByIdQuery(this.db, cardId);
  }

  async getAllCards() {
    return getAllCardsQuery(this.db);
  }

  async getAllCardsForCollection(collectionId: string) {
    return getAllCardsForCollectionQuery(this.db, collectionId);
  }

  async updateCard(updateData: UpdateCard) {
    return updateCardQuery(this.db, updateData);
  }

  async deleteCard(cardId: string) {
    return deleteCardQuery(this.db, cardId);
  }
}

import { InsertCard, UpdateCard } from "@/src/domain/tcg/card.model";
import { DB } from "@/src/infra/db/db";
import { createCardQuery } from "@/src/infra/repos/card/create-card.query";
import { deleteCardQuery } from "@/src/infra/repos/card/delete-card.query";
import {
  GetAllCardsForCollectionOptions,
  getAllCardsForCollectionQuery,
} from "@/src/infra/repos/card/get-all-cards-for-collection.query";
import {
  GetAllCardsOptions,
  getAllCardsQuery,
} from "@/src/infra/repos/card/get-all-cards.query";
import { getCardByIdQuery } from "@/src/infra/repos/card/get-card-by-id.query";
import {
  GetCardOptions,
  getCardQuery,
} from "@/src/infra/repos/card/get-card.query";
import { getCardsByPriceQuery } from "@/src/infra/repos/card/get-cards-by-price.query";
import { updateCardQuery } from "@/src/infra/repos/card/update-card.query";

export class CardsUseCase {
  private readonly db: DB;

  constructor(db: DB) {
    this.db = db;
  }

  async createCard(insertCard: InsertCard) {
    return createCardQuery(this.db, insertCard);
  }

  async getCard(scryfallId: string, options?: GetCardOptions) {
    return getCardQuery(this.db, scryfallId, options);
  }

  async getCardById(cardId: string) {
    return getCardByIdQuery(this.db, cardId);
  }

  async getAllCards(options?: GetAllCardsOptions) {
    return getAllCardsQuery(this.db, options);
  }

  async getAllCardsForCollection(
    collectionId: string,
    options?: GetAllCardsForCollectionOptions
  ) {
    return getAllCardsForCollectionQuery(this.db, collectionId, options);
  }

  async updateCard(updateData: UpdateCard) {
    return updateCardQuery(this.db, updateData);
  }

  async deleteCard(cardId: string) {
    return deleteCardQuery(this.db, cardId);
  }

  async getCardsByPrice(options?: {
    minPrice?: number;
    maxPrice?: number;
    page?: number;
    pageSize?: number;
    priceSource?: "tcg" | "scg" | "custom" | "mtggoldfish" | "cardmarket";
    includeFoil?: boolean;
    sortBy?: "price" | "name" | "setName";
    sortOrder?: "asc" | "desc";
    onlyAvailable?: boolean;
  }) {
    return getCardsByPriceQuery(this.db, options);
  }
}

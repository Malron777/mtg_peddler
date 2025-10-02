import { InsertPriceHistory, PriceHistory } from "@/src/domain/tcg/card.model";
import { DB } from "@/src/infra/db/db";
import { createPriceHistoryQuery } from "@/src/infra/repos/card/create-price-history.query";
import { deletePriceHistoryQuery } from "@/src/infra/repos/card/delete-price-history.query";
import { getAllPriceHistoryQuery } from "@/src/infra/repos/card/get-all-price-history.query";
import { getPriceHistoryForCardQuery } from "@/src/infra/repos/card/get-price-history-for-card.query";
import { getPriceHistoryQuery } from "@/src/infra/repos/card/get-price-history.query";
import { updatePriceHistoryQuery } from "@/src/infra/repos/card/update-price-history.query";

export class PriceHistoryUseCase {
  private readonly db: DB;

  constructor(db: DB) {
    this.db = db;
  }

  async createPriceHistory(insertPriceHistory: InsertPriceHistory) {
    return createPriceHistoryQuery(this.db, insertPriceHistory);
  }

  async getPriceHistory(priceHistoryId: string) {
    return getPriceHistoryQuery(this.db, priceHistoryId);
  }

  async getPriceHistoryForCard(cardId: string) {
    return getPriceHistoryForCardQuery(this.db, cardId);
  }

  async getAllPriceHistory() {
    return getAllPriceHistoryQuery(this.db);
  }

  async updatePriceHistory(updateData: Partial<PriceHistory>) {
    return updatePriceHistoryQuery(this.db, updateData);
  }

  async deletePriceHistory(priceHistoryId: string) {
    return deletePriceHistoryQuery(this.db, priceHistoryId);
  }
}

import { InsertPromotion } from "@/src/domain/auth/stores.model";
import { UpdatePromotion } from "@/src/domain/tcg/promotion.model";
import { DB } from "@/src/infra/db/db";
import { createPromotionQuery } from "@/src/infra/repos/store/create-promotion.query";
import { deletePromotionQuery } from "@/src/infra/repos/store/delete-promotion.query";
import { getAllActivePromotionsForStoreQuery } from "@/src/infra/repos/store/get-all-active-promotions-for-store.query";
import { getAllActivePromotionsQuery } from "@/src/infra/repos/store/get-all-active-promotions.query";
import { getAllPromotionsForStoreQuery } from "@/src/infra/repos/store/get-all-promotions-for-store.query";
import { getAllPromotionsQuery } from "@/src/infra/repos/store/get-all-promotions.query";
import { getPromotionQuery } from "@/src/infra/repos/store/get-promotion.query";
import { updatePromotionQuery } from "@/src/infra/repos/store/update-promotion.query";

export class PromotionsUseCase {
  private readonly db: DB;

  constructor(db: DB) {
    this.db = db;
  }

  async createPromotion(insertPromotion: InsertPromotion) {
    return createPromotionQuery(this.db, insertPromotion);
  }

  async getPromotion(promotionId: string) {
    return getPromotionQuery(this.db, promotionId);
  }

  async getAllPromotions() {
    return getAllPromotionsQuery(this.db);
  }

  async getAllPromotionsForStore(storeId: string) {
    return getAllPromotionsForStoreQuery(this.db, storeId);
  }

  async getAllActivePromotions() {
    return getAllActivePromotionsQuery(this.db);
  }

  async getAllActivePromotionsForStore(storeId: string) {
    return getAllActivePromotionsForStoreQuery(this.db, storeId);
  }

  async updatePromotion(updateData: UpdatePromotion) {
    return updatePromotionQuery(this.db, updateData);
  }

  async deletePromotion(promotionId: string) {
    return deletePromotionQuery(this.db, promotionId);
  }
}

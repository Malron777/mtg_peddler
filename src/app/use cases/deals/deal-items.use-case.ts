import { UpdateDealItem } from "@/src/domain/tcg/deal-item.model";
import { DB } from "@/src/infra/db/db";
import { getAllDealItemsForDealQuery } from "@/src/infra/repos/deals/get-all-deal-items-for-deal.query";
import { getAllDealItemsQuery } from "@/src/infra/repos/deals/get-all-deal-items.query";
import { getDealItemQuery } from "@/src/infra/repos/deals/get-deal-item.query";
import { updateDealItemQuery } from "@/src/infra/repos/deals/update-deal-item.query";

export class DealItemsUseCase {
  private readonly db: DB;

  constructor(db: DB) {
    this.db = db;
  }

  async getAllDealItems() {
    return getAllDealItemsQuery(this.db);
  }

  async getAllDealItemsForDeal(dealId: string) {
    return getAllDealItemsForDealQuery(this.db, dealId);
  }

  async getDealItem(dealItemId: string) {
    return getDealItemQuery(this.db, dealItemId);
  }

  async updateDealItem(updateData: UpdateDealItem) {
    return updateDealItemQuery(this.db, updateData);
  }
}

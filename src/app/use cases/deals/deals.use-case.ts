import { UpdateDeal } from "@/src/domain/tcg/deal.model";
import { DB } from "@/src/infra/db/db";
import { getAllDealsForCardQuery } from "@/src/infra/repos/deals/get-all-deals-for-card.query";
import { getAllDealsForCollectionQuery } from "@/src/infra/repos/deals/get-all-deals-for-collection.query";
import { getAllDealsForUserQuery } from "@/src/infra/repos/deals/get-all-deals-for-user.query";
import { getAllDealsQuery } from "@/src/infra/repos/deals/get-all-deals.query";
import { getDealQuery } from "@/src/infra/repos/deals/get-deal.query";
import { updateDealQuery } from "@/src/infra/repos/deals/update-deal.query";

export class DealsUseCase {
  private readonly db: DB;

  constructor(db: DB) {
    this.db = db;
  }

  async getAllDeals() {
    return getAllDealsQuery(this.db);
  }

  async getAllDealsForUser(userId: string) {
    return getAllDealsForUserQuery(this.db, userId);
  }

  async getAllDealsForCard(cardId: string) {
    return getAllDealsForCardQuery(this.db, cardId);
  }

  async getAllDealsForCollection(collectionId: string) {
    return getAllDealsForCollectionQuery(this.db, collectionId);
  }

  async getDeal(dealId: string) {
    return getDealQuery(this.db, dealId);
  }

  async updateDeal(updateData: UpdateDeal) {
    return updateDealQuery(this.db, updateData);
  }
}

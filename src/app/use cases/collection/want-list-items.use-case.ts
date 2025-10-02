import {
  InsertWantListItem,
  UpdateWantListItem,
} from "@/src/domain/tcg/want-list-item.model";
import { DB } from "@/src/infra/db/db";
import { createWantListItemQuery } from "@/src/infra/repos/collection/create-want-list-item.query";
import { getAllWantListItemsForWantListQuery } from "@/src/infra/repos/collection/get-all-want-list-items-for-want-list.query";
import { getAllWantListItemsQuery } from "@/src/infra/repos/collection/get-all-want-list-items.query";
import { getWantListItemQuery } from "@/src/infra/repos/collection/get-want-list-item.query";
import { updateWantListItemQuery } from "@/src/infra/repos/collection/update-want-list-item.query";

export class WantListItemsUseCase {
  private readonly db: DB;

  constructor(db: DB) {
    this.db = db;
  }

  async createWantListItem(insertWantListItem: InsertWantListItem) {
    return createWantListItemQuery(this.db, insertWantListItem);
  }

  async getWantListItem(wantListItemId: string) {
    return getWantListItemQuery(this.db, wantListItemId);
  }

  async getAllWantListItems() {
    return getAllWantListItemsQuery(this.db);
  }

  async getAllWantListItemsForWantList(wantListId: string) {
    return getAllWantListItemsForWantListQuery(this.db, wantListId);
  }

  async updateWantListItem(updateData: UpdateWantListItem) {
    return updateWantListItemQuery(this.db, updateData);
  }
}

import {
  InsertWantList,
  UpdateWantList,
} from "@/src/domain/tcg/want-list.model";
import { DB } from "@/src/infra/db/db";
import { createWantListQuery } from "@/src/infra/repos/collection/create-want-list.query";
import { deleteWantListQuery } from "@/src/infra/repos/collection/delete-want-list.query";
import { getAllWantListsForUserQuery } from "@/src/infra/repos/collection/get-all-want-lists-for-user.query";
import { getAllWantListsQuery } from "@/src/infra/repos/collection/get-all-want-lists.query";
import { getWantListQuery } from "@/src/infra/repos/collection/get-want-list.query";
import { updateWantListQuery } from "@/src/infra/repos/collection/update-want-list.query";

export class WantListsUseCase {
  private readonly db: DB;

  constructor(db: DB) {
    this.db = db;
  }

  async createWantList(insertWantList: InsertWantList) {
    return createWantListQuery(this.db, insertWantList);
  }

  async getWantList(wantListId: string) {
    return getWantListQuery(this.db, wantListId);
  }

  async getAllWantLists() {
    return getAllWantListsQuery(this.db);
  }

  async getAllWantListsForUser(userId: string) {
    return getAllWantListsForUserQuery(this.db, userId);
  }

  async updateWantList(updateData: UpdateWantList) {
    return updateWantListQuery(this.db, updateData);
  }

  async deleteWantList(wantListId: string) {
    return deleteWantListQuery(this.db, wantListId);
  }
}

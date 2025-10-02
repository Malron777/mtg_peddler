import {
  InsertCollectionItem,
  UpdateCollectionItem,
} from "@/src/domain/tcg/collection-item.model";
import { DB } from "@/src/infra/db/db";
import { createCollectionItemQuery } from "@/src/infra/repos/collection/create-collection-item.query";
import { deleteCollectionItemQuery } from "@/src/infra/repos/collection/delete-collection-item.query";
import { getAllCollectionItemsForCollectionQuery } from "@/src/infra/repos/collection/get-all-collection-items-for-collection.query";
import { getAllCollectionItemsQuery } from "@/src/infra/repos/collection/get-all-collection-items.query";
import { getCollectionItemByIdQuery } from "@/src/infra/repos/collection/get-collection-item-by-id.query";
import { getCollectionItemQuery } from "@/src/infra/repos/collection/get-collection-item.query";
import { updateCollectionItemQuery } from "@/src/infra/repos/collection/update-collection-item.query";

export class CollectionItemsUseCase {
  private readonly db: DB;

  constructor(db: DB) {
    this.db = db;
  }

  async createCollectionItem(insertCollectionItem: InsertCollectionItem) {
    return createCollectionItemQuery(this.db, insertCollectionItem);
  }

  async getCollectionItem(collectionItemId: string) {
    return getCollectionItemQuery(this.db, collectionItemId);
  }

  async getCollectionItemById(collectionItemId: string) {
    return getCollectionItemByIdQuery(this.db, collectionItemId);
  }

  async getAllCollectionItems() {
    return getAllCollectionItemsQuery(this.db);
  }

  async getAllCollectionItemsForCollection(collectionId: string) {
    return getAllCollectionItemsForCollectionQuery(this.db, collectionId);
  }

  async updateCollectionItem(updateData: UpdateCollectionItem) {
    return updateCollectionItemQuery(this.db, updateData);
  }

  async deleteCollectionItem(collectionItemId: string) {
    return deleteCollectionItemQuery(this.db, collectionItemId);
  }
}

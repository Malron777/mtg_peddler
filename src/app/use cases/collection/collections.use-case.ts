import {
  InsertCollection,
  UpdateCollection,
} from "@/src/domain/tcg/collection.model";
import { DB } from "@/src/infra/db/db";
import { createCollectionQuery } from "@/src/infra/repos/collection/create-collection.query";
import { deleteCollectionQuery } from "@/src/infra/repos/collection/delete-collection.query";
import { getAllCollectionsContainingCardQuery } from "@/src/infra/repos/collection/get-all-collections-containing-cards.query";
import { getAllCollectionsForUserQuery } from "@/src/infra/repos/collection/get-all-collections-for-user.query";
import { getAllCollectionsQuery } from "@/src/infra/repos/collection/get-all-collections.query";
import { getCollectionQuery } from "@/src/infra/repos/collection/get-collection.query";
import { updateCollectionQuery } from "@/src/infra/repos/collection/update-collection.query";

export class CollectionsUseCase {
  private readonly db: DB;

  constructor(db: DB) {
    this.db = db;
  }

  async createCollection(insertCollection: InsertCollection) {
    return createCollectionQuery(this.db, insertCollection);
  }

  async getCollection(collectionId: string) {
    return getCollectionQuery(this.db, collectionId);
  }

  async getAllCollections() {
    return getAllCollectionsQuery(this.db);
  }

  async getAllCollectionsForUser(userId: string) {
    return getAllCollectionsForUserQuery(this.db, userId);
  }

  async getAllCollectionsContainingCard(cardId: string) {
    return getAllCollectionsContainingCardQuery(this.db, cardId);
  }

  async updateCollection(updateData: UpdateCollection) {
    return updateCollectionQuery(this.db, updateData);
  }

  async deleteCollection(collectionId: string) {
    return deleteCollectionQuery(this.db, collectionId);
  }
}

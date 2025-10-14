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
import { getCollectionValueQuery } from "@/src/infra/repos/collection/get-collection-value.query";
import { getCollectionQuery } from "@/src/infra/repos/collection/get-collection.query";
import { getManyCollectionsValueQuery } from "@/src/infra/repos/collection/get-many-collections-value.query";
import { getWantListMatchesQuery } from "@/src/infra/repos/collection/get-want-list-matches.query";
import { removeDealCardsFromCollectionQuery } from "@/src/infra/repos/collection/remove-deal-cards-from-collection.query";
import { updateCollectionQuery } from "@/src/infra/repos/collection/update-collection.query";
import { getCollectionInformationUseCase } from "./get-collection-information.use-case";

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

  async getCollectionValue(
    collectionId: string,
    options?: {
      includeFoil?: boolean;
      priceSource?: "tcg" | "scg" | "custom" | "mtggoldfish" | "cardmarket";
    }
  ) {
    return getCollectionValueQuery(this.db, collectionId, options);
  }

  async getManyCollectionsValue(
    collectionIds: string[],
    options?: {
      includeFoil?: boolean;
      priceSource?: "tcg" | "scg" | "custom" | "mtggoldfish" | "cardmarket";
    }
  ) {
    return getManyCollectionsValueQuery(this.db, collectionIds, options);
  }

  async getWantListMatches(options: {
    userId?: string;
    wantListId?: string;
    includePrivateCollections?: boolean;
  }) {
    return getWantListMatchesQuery(this.db, options);
  }

  async removeDealCardsFromCollection(
    dealId: string,
    collectionId: string,
    options?: { dryRun?: boolean }
  ) {
    return removeDealCardsFromCollectionQuery(
      this.db,
      dealId,
      collectionId,
      options
    );
  }

  async getCollectionInformation(
    userId: string,
    options?: {
      includeFoil?: boolean;
      priceSource?: "tcg" | "scg" | "custom" | "mtggoldfish" | "cardmarket";
    }
  ) {
    return getCollectionInformationUseCase(this.db, userId, options);
  }
}

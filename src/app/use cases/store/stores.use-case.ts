import { InsertStore, UpdateStore } from "@/src/domain/auth/stores.model";
import { DB } from "@/src/infra/db/db";
import { createStoreQuery } from "@/src/infra/repos/store/create-store.query";
import { getAllStoresQuery } from "@/src/infra/repos/store/get-all-stores.query";
import { getStoreQuery } from "@/src/infra/repos/store/get-store.query";
import { updateStoreQuery } from "@/src/infra/repos/store/update-store.query";

export class StoresUseCase {
  private readonly db: DB;

  constructor(db: DB) {
    this.db = db;
  }

  async getStore(storeId: string) {
    return getStoreQuery(this.db, storeId);
  }

  async getAllStores() {
    return getAllStoresQuery(this.db);
  }

  async createStore(insertData: InsertStore) {
    return createStoreQuery(this.db, insertData);
  }

  async updateStore(updateData: UpdateStore) {
    return updateStoreQuery(this.db, updateData);
  }
}

import { UpdateStoreStaff } from "@/src/domain/auth/store-staff.model";
import { InsertStoreStaff } from "@/src/domain/auth/stores.model";
import { DB } from "@/src/infra/db/db";
import { createStoreStaffQuery } from "@/src/infra/repos/store/create-store-staff.query";
import { deleteStoreStaffQuery } from "@/src/infra/repos/store/delete-store-staff.query";
import { getAllStoreStaffForStoreQuery } from "@/src/infra/repos/store/get-all-store-staff-for-store.query";
import { getAllStoreStaffQuery } from "@/src/infra/repos/store/get-all-store-staff.query";
import { getStoreStaffQuery } from "@/src/infra/repos/store/get-store-staff.query";
import { updateStoreStaffQuery } from "@/src/infra/repos/store/update-store-staff.query";

export class StoreStaffUseCase {
  private readonly db: DB;

  constructor(db: DB) {
    this.db = db;
  }

  async createStoreStaff(insertStoreStaff: InsertStoreStaff) {
    return createStoreStaffQuery(this.db, insertStoreStaff);
  }

  async getStoreStaff(storeId: string, staffId: string) {
    return getStoreStaffQuery(this.db, storeId, staffId);
  }

  async getAllStoreStaff() {
    return getAllStoreStaffQuery(this.db);
  }

  async getAllStoreStaffForStore(storeId: string) {
    return getAllStoreStaffForStoreQuery(this.db, storeId);
  }

  async updateStoreStaff(updateData: UpdateStoreStaff) {
    return updateStoreStaffQuery(this.db, updateData);
  }

  async deleteStoreStaff(storeId: string, userId: string) {
    return deleteStoreStaffQuery(this.db, storeId, userId);
  }
}

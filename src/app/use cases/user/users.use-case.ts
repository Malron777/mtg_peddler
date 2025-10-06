import { UpdateUser } from "@/src/domain/auth/user.model";
import { DB } from "@/src/infra/db/db";
import { getAllUsersQuery } from "@/src/infra/repos/user/get-all-users.query";
import { getUserQuery } from "@/src/infra/repos/user/get-user.query";
import { updateUserQuery } from "@/src/infra/repos/user/update-user.query";

export class UsersUseCase {
  private readonly db: DB;

  constructor(db: DB) {
    this.db = db;
  }

  async getUser(userId: string) {
    return getUserQuery(this.db, userId);
  }

  async getAllUsers() {
    return getAllUsersQuery(this.db);
  }

  async updateUser(updateData: UpdateUser) {
    return updateUserQuery(this.db, updateData);
  }
}

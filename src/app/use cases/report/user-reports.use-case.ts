import {
  InsertUserReport,
  UpdateUserReport,
} from "@/src/domain/auth/user-reports.model";
import { DB } from "@/src/infra/db/db";
import { createUserReportQuery } from "@/src/infra/repos/report/create-user-report.query";
import { deleteUserReportQuery } from "@/src/infra/repos/report/delete-user-report.query";
import { getAllUserReportsForDealQuery } from "@/src/infra/repos/report/get-all-user-reports-for-deal.query";
import { getAllUserReportsForUserQuery } from "@/src/infra/repos/report/get-all-user-reports-for-user.query";
import { getAllUserReportsQuery } from "@/src/infra/repos/report/get-all-user-reports.query";
import { getUserReportQuery } from "@/src/infra/repos/report/get-user-report.query";
import { updateUserReportQuery } from "@/src/infra/repos/report/update-user-report.query";

export class UserReportsUseCase {
  private readonly db: DB;

  constructor(db: DB) {
    this.db = db;
  }

  async createUserReport(insertUserReport: InsertUserReport) {
    return createUserReportQuery(this.db, insertUserReport);
  }

  async getUserReport(reportId: string) {
    return getUserReportQuery(this.db, reportId);
  }

  async getAllUserReports() {
    return getAllUserReportsQuery(this.db);
  }

  async getAllUserReportsForUser(userId: string) {
    return getAllUserReportsForUserQuery(this.db, userId);
  }

  async getAllUserReportsForDeal(dealId: string) {
    return getAllUserReportsForDealQuery(this.db, dealId);
  }

  async updateUserReport(updateData: UpdateUserReport) {
    return updateUserReportQuery(this.db, updateData);
  }

  async deleteUserReport(reportId: string) {
    return deleteUserReportQuery(this.db, reportId);
  }
}

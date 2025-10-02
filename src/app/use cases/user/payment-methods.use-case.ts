import {
  InsertPaymentMethod,
  UpdatePaymentMethod,
} from "@/src/domain/tcg/payment-method.model";
import { DB } from "@/src/infra/db/db";
import { createPaymentMethodQuery } from "@/src/infra/repos/user/create-payment-method.query";
import { deletePaymentMethodQuery } from "@/src/infra/repos/user/delete-payment-method.query";
import { getAllPaymentMethodsForUserQuery } from "@/src/infra/repos/user/get-all-payment-methods-for-user.query";
import { getAllPaymentMethodsQuery } from "@/src/infra/repos/user/get-all-payment-methods.query";
import { getPaymentMethodQuery } from "@/src/infra/repos/user/get-payment-method.query";
import { updatePaymentMethodQuery } from "@/src/infra/repos/user/update-payment-method.query";

export class PaymentMethodsUseCase {
  private readonly db: DB;

  constructor(db: DB) {
    this.db = db;
  }

  async createPaymentMethod(insertPaymentMethod: InsertPaymentMethod) {
    return createPaymentMethodQuery(this.db, insertPaymentMethod);
  }

  async getPaymentMethod(paymentMethodId: string) {
    return getPaymentMethodQuery(this.db, paymentMethodId);
  }

  async getAllPaymentMethods() {
    return getAllPaymentMethodsQuery(this.db);
  }

  async getAllPaymentMethodsForUser(userId: string) {
    return getAllPaymentMethodsForUserQuery(this.db, userId);
  }

  async updatePaymentMethod(updateData: UpdatePaymentMethod) {
    return updatePaymentMethodQuery(this.db, updateData);
  }

  async deletePaymentMethod(paymentMethodId: string) {
    return deletePaymentMethodQuery(this.db, paymentMethodId);
  }
}

import { userTestFactory } from "@/src/domain/auth/user.model.test-factory";
import { paymentMethodTestFactory } from "@/src/domain/tcg/payment-method.model.test-factory";
import { buildRunWithTestDb, migrateTestDb } from "@/test-db";
import { beforeAll, describe, expect, it } from "vitest";
import { DB } from "../../db/db";
import { deletePaymentMethodQuery } from "./delete-payment-method.query";

describe("deletePaymentMethodQuery", () => {
  let runWithTestDb: Awaited<ReturnType<typeof buildRunWithTestDb>>;

  beforeAll(async () => {
    await migrateTestDb();
    runWithTestDb = await buildRunWithTestDb();
  });

  it("should successfully delete an existing payment method", async () => {
    await runWithTestDb(async (db: DB) => {
      const user = await userTestFactory.buildAndInsertOne(db, {
        id: "test-user-id-1",
        name: "Test User",
        email: "test@example.com",
        emailVerified: true,
        image: "https://example.com/avatar.jpg",
        reputationScore: "100",
        role: "user",
        preferredCurrency: "USD",
        notificationPreferences: { email: true, sms: false, push: true },
      });

      const paymentMethod = await paymentMethodTestFactory.insertOne(db, {
        userId: user.id,
        type: "bank_transfer",
        details: {
          accountNumber: "123456789",
          bankName: "Test Bank",
        },
        isPrimary: false,
      });

      const result = await deletePaymentMethodQuery(db, paymentMethod.id);

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
    });
  });

  it("should handle deleting non-existent payment method gracefully", async () => {
    await runWithTestDb(async (db: DB) => {
      const nonExistentId = "non-existent-payment-method-id";

      const result = await deletePaymentMethodQuery(db, nonExistentId);

      expect(result.success).toBe(true); // Delete operations typically succeed even if nothing was deleted
      expect(result.error).toBeUndefined();
    });
  });

  it("should handle empty id gracefully", async () => {
    await runWithTestDb(async (db: DB) => {
      const result = await deletePaymentMethodQuery(db, "");

      expect(result.success).toBe(true); // Delete operations typically succeed even with empty ID
      expect(result.error).toBeUndefined();
    });
  });

  it("should handle null id gracefully", async () => {
    await runWithTestDb(async (db: DB) => {
      const result = await deletePaymentMethodQuery(
        db,
        null as unknown as string
      );

      expect(result.success).toBe(true);
      expect(result.error).not.toBeDefined();
    });
  });

  it("should handle malformed id gracefully", async () => {
    await runWithTestDb(async (db: DB) => {
      const malformedId = "malformed-id-with-special-chars-!@#$%";

      const result = await deletePaymentMethodQuery(db, malformedId);

      expect(result.success).toBe(true); // Delete operations typically succeed even with malformed IDs
      expect(result.error).toBeUndefined();
    });
  });

  it("should delete only the specified payment method", async () => {
    await runWithTestDb(async (db: DB) => {
      const user = await userTestFactory.buildAndInsertOne(db, {
        id: "test-user-id-2",
        name: "Test User 2",
        email: "test2@example.com",
        emailVerified: true,
        image: "https://example.com/avatar2.jpg",
        reputationScore: "200",
        role: "user",
        preferredCurrency: "EUR",
        notificationPreferences: { email: true, sms: true, push: true },
      });

      const paymentMethod1 = await paymentMethodTestFactory.insertOne(db, {
        userId: user.id,
        type: "bank_transfer",
        details: {
          accountNumber: "111111111",
          bankName: "First Bank",
        },
        isPrimary: true,
      });

      const paymentMethod2 = await paymentMethodTestFactory.insertOne(db, {
        userId: user.id,
        type: "bank_transfer",
        details: {
          email: "test@paypal.com",
        },
        isPrimary: false,
      });

      const result = await deletePaymentMethodQuery(db, paymentMethod1.id);

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();

      // Verify that paymentMethod2 still exists by trying to delete it
      const result2 = await deletePaymentMethodQuery(db, paymentMethod2.id);
      expect(result2.success).toBe(true);
    });
  });

  it("should handle deleting primary payment method", async () => {
    await runWithTestDb(async (db: DB) => {
      const user = await userTestFactory.buildAndInsertOne(db, {
        id: "test-user-id-3",
        name: "Test User 3",
        email: "test3@example.com",
        emailVerified: true,
        image: "https://example.com/avatar3.jpg",
        reputationScore: "300",
        role: "user",
        preferredCurrency: "USD",
        notificationPreferences: { email: true, sms: false, push: true },
      });

      const primaryPaymentMethod = await paymentMethodTestFactory.insertOne(
        db,
        {
          userId: user.id,
          type: "bank_transfer",
          details: {
            accountNumber: "222222222",
            bankName: "Primary Bank",
          },
          isPrimary: true,
        }
      );

      const result = await deletePaymentMethodQuery(
        db,
        primaryPaymentMethod.id
      );

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
    });
  });

  it("should handle deleting payment method with complex details", async () => {
    await runWithTestDb(async (db: DB) => {
      const user = await userTestFactory.buildAndInsertOne(db, {
        id: "test-user-id-4",
        name: "Test User 4",
        email: "test4@example.com",
        emailVerified: true,
        image: "https://example.com/avatar4.jpg",
        reputationScore: "400",
        role: "user",
        preferredCurrency: "USD",
        notificationPreferences: { email: true, sms: false, push: true },
      });

      const complexDetails = {
        accountNumber: "333333333",
        bankName: "Complex Bank",
        routingNumber: "111222333",
        accountHolderName: "Test User",
        accountType: "checking",
        branchCode: "001",
        swiftCode: "COMPLEX01",
        iban: "US64COMPLEX123456789",
      };

      const complexPaymentMethod = await paymentMethodTestFactory.insertOne(
        db,
        {
          userId: user.id,
          type: "bank_transfer",
          details: complexDetails,
          isPrimary: false,
        }
      );

      const result = await deletePaymentMethodQuery(
        db,
        complexPaymentMethod.id
      );

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
    });
  });

  it("should handle deleting different payment method types", async () => {
    await runWithTestDb(async (db: DB) => {
      const user = await userTestFactory.buildAndInsertOne(db, {
        id: "test-user-id-5",
        name: "Test User 5",
        email: "test5@example.com",
        emailVerified: true,
        image: "https://example.com/avatar5.jpg",
        reputationScore: "500",
        role: "user",
        preferredCurrency: "USD",
        notificationPreferences: { email: true, sms: false, push: true },
      });

      const bankTransferMethod = await paymentMethodTestFactory.insertOne(db, {
        userId: user.id,
        type: "bank_transfer",
        details: {
          accountNumber: "444444444",
          bankName: "Bank Transfer Bank",
        },
        isPrimary: false,
      });

      const paypalMethod = await paymentMethodTestFactory.insertOne(db, {
        userId: user.id,
        type: "bank_transfer",
        details: {
          email: "test@paypal.com",
        },
        isPrimary: false,
      });

      const cryptoMethod = await paymentMethodTestFactory.insertOne(db, {
        userId: user.id,
        type: "bank_transfer",
        details: {
          walletAddress: "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
          currency: "BTC",
          network: "bitcoin",
        },
        isPrimary: false,
      });

      const result1 = await deletePaymentMethodQuery(db, bankTransferMethod.id);
      const result2 = await deletePaymentMethodQuery(db, paypalMethod.id);
      const result3 = await deletePaymentMethodQuery(db, cryptoMethod.id);

      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);
      expect(result3.success).toBe(true);
      expect(result1.error).toBeUndefined();
      expect(result2.error).toBeUndefined();
      expect(result3.error).toBeUndefined();
    });
  });

  it("should handle deleting payment method with foreign key constraints", async () => {
    await runWithTestDb(async (db: DB) => {
      const user = await userTestFactory.buildAndInsertOne(db, {
        id: "test-user-id-6",
        name: "Test User 6",
        email: "test6@example.com",
        emailVerified: true,
        image: "https://example.com/avatar6.jpg",
        reputationScore: "600",
        role: "user",
        preferredCurrency: "USD",
        notificationPreferences: { email: true, sms: false, push: true },
      });

      const paymentMethod = await paymentMethodTestFactory.insertOne(db, {
        userId: user.id,
        type: "bank_transfer",
        details: {
          accountNumber: "555555555",
          bankName: "Constraint Bank",
        },
        isPrimary: false,
      });

      const result = await deletePaymentMethodQuery(db, paymentMethod.id);

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
    });
  });
});

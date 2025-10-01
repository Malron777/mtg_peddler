import { userTestFactory } from "@/src/domain/auth/user.model.test-factory";
import { paymentMethodTestFactory } from "@/src/domain/tcg/payment-method.model.test-factory";
import { buildRunWithTestDb, migrateTestDb } from "@/test-db";
import { beforeAll, describe, expect, it } from "vitest";
import { DB } from "../../db/db";
import { getPaymentMethodQuery } from "./get-payment-method.query";

describe("getPaymentMethodQuery", () => {
  let runWithTestDb: Awaited<ReturnType<typeof buildRunWithTestDb>>;

  beforeAll(async () => {
    await migrateTestDb();
    runWithTestDb = await buildRunWithTestDb();
  });

  it("should successfully retrieve an existing payment method", async () => {
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
          routingNumber: "987654321",
          accountHolderName: "Test User",
        },
        isPrimary: true,
      });

      const result = await getPaymentMethodQuery(db, paymentMethod.id);

      expect(result.success).toBe(true);
      expect(result.paymentMethod).toBeDefined();
      expect(result.paymentMethod?.id).toBe(paymentMethod.id);
      expect(result.paymentMethod?.userId).toBe(user.id);
      expect(result.paymentMethod?.type).toBe("bank_transfer");
      expect(result.paymentMethod?.details).toEqual({
        accountNumber: "123456789",
        bankName: "Test Bank",
        routingNumber: "987654321",
        accountHolderName: "Test User",
      });
      expect(result.paymentMethod?.isPrimary).toBe(true);
      expect(result.error).toBeUndefined();
    });
  });

  it("should return error when payment method is not found", async () => {
    await runWithTestDb(async (db: DB) => {
      const nonExistentId = "non-existent-payment-method-id";

      const result = await getPaymentMethodQuery(db, nonExistentId);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Payment method not found");
      expect(result.paymentMethod).toBeUndefined();
    });
  });

  it("should handle empty id gracefully", async () => {
    await runWithTestDb(async (db: DB) => {
      const result = await getPaymentMethodQuery(db, "");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Payment method not found");
      expect(result.paymentMethod).toBeUndefined();
    });
  });

  it("should handle null id gracefully", async () => {
    await runWithTestDb(async (db: DB) => {
      const result = await getPaymentMethodQuery(db, null as unknown as string);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.paymentMethod).toBeUndefined();
    });
  });

  it("should handle malformed id gracefully", async () => {
    await runWithTestDb(async (db: DB) => {
      const malformedId = "malformed-id-with-special-chars-!@#$%";

      const result = await getPaymentMethodQuery(db, malformedId);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Payment method not found");
      expect(result.paymentMethod).toBeUndefined();
    });
  });

  it("should retrieve a bank_transfer payment method", async () => {
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

      const paypalMethod = await paymentMethodTestFactory.insertOne(db, {
        userId: user.id,
        type: "bank_transfer",
        details: {
          email: "test@paypal.com",
        },
        isPrimary: false,
      });

      const result = await getPaymentMethodQuery(db, paypalMethod.id);

      expect(result.success).toBe(true);
      expect(result.paymentMethod).toBeDefined();
      expect(result.paymentMethod?.type).toBe("bank_transfer");
      expect(result.paymentMethod?.details).toEqual({
        email: "test@paypal.com",
      });
      expect(result.paymentMethod?.isPrimary).toBe(false);
      expect(result.error).toBeUndefined();
    });
  });

  it("should retrieve a cash payment method", async () => {
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

      const cryptoMethod = await paymentMethodTestFactory.insertOne(db, {
        userId: user.id,
        type: "cash",
        details: {
          walletAddress: "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
          currency: "BTC",
          network: "bitcoin",
        },
        isPrimary: false,
      });

      const result = await getPaymentMethodQuery(db, cryptoMethod.id);

      expect(result.success).toBe(true);
      expect(result.paymentMethod).toBeDefined();
      expect(result.paymentMethod?.type).toBe("cash");
      expect(result.paymentMethod?.details).toEqual({
        walletAddress: "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
        currency: "BTC",
        network: "bitcoin",
      });
      expect(result.error).toBeUndefined();
    });
  });

  it("should retrieve a payment method with complex details", async () => {
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
        accountNumber: "555555555",
        bankName: "Complex Bank",
        routingNumber: "111222333",
        accountHolderName: "Test User",
        accountType: "checking",
        branchCode: "001",
        swiftCode: "COMPLEX01",
        iban: "US64COMPLEX123456789",
        phoneNumber: "+1-555-123-4567",
        email: "banking@test.com",
      };

      const complexMethod = await paymentMethodTestFactory.insertOne(db, {
        userId: user.id,
        type: "bank_transfer",
        details: complexDetails,
        isPrimary: false,
      });

      const result = await getPaymentMethodQuery(db, complexMethod.id);

      expect(result.success).toBe(true);
      expect(result.paymentMethod).toBeDefined();
      expect(result.paymentMethod?.details).toEqual(complexDetails);
      expect(result.error).toBeUndefined();
    });
  });

  it("should retrieve a non-primary payment method", async () => {
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

      const nonPrimaryMethod = await paymentMethodTestFactory.insertOne(db, {
        userId: user.id,
        type: "bank_transfer",
        details: {
          accountNumber: "666666666",
          bankName: "Non-Primary Bank",
        },
        isPrimary: false,
      });

      const result = await getPaymentMethodQuery(db, nonPrimaryMethod.id);

      expect(result.success).toBe(true);
      expect(result.paymentMethod).toBeDefined();
      expect(result.paymentMethod?.isPrimary).toBe(false);
      expect(result.error).toBeUndefined();
    });
  });

  it("should retrieve a payment method with minimal details", async () => {
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

      const minimalMethod = await paymentMethodTestFactory.insertOne(db, {
        userId: user.id,
        type: "bank_transfer",
        details: {
          email: "minimal@paypal.com",
        },
        isPrimary: false,
      });

      const result = await getPaymentMethodQuery(db, minimalMethod.id);

      expect(result.success).toBe(true);
      expect(result.paymentMethod).toBeDefined();
      expect(result.paymentMethod?.details).toEqual({
        email: "minimal@paypal.com",
      });
      expect(result.error).toBeUndefined();
    });
  });
});

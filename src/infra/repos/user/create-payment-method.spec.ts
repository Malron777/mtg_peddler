import { userTestFactory } from "@/src/domain/auth/user.model.test-factory";
import { paymentMethodTestFactory } from "@/src/domain/tcg/payment-method.model.test-factory";
import { buildRunWithTestDb, migrateTestDb } from "@/test-db";
import { beforeAll, describe, expect, it } from "vitest";
import { DB } from "../../db/db";
import { createPaymentMethodQuery } from "./create-payment-method.query";

describe("createPaymentMethodQuery", () => {
  let runWithTestDb: Awaited<ReturnType<typeof buildRunWithTestDb>>;

  beforeAll(async () => {
    await migrateTestDb();
    runWithTestDb = await buildRunWithTestDb();
  });

  it("should successfully create a payment method", async () => {
    await runWithTestDb(async (db: DB) => {
      const user = await userTestFactory.insertOne(db, {
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

      const paymentMethodData = paymentMethodTestFactory.buildOne({
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

      const result = await createPaymentMethodQuery(db, paymentMethodData);

      expect(result.success).toBe(true);
      expect(result.paymentMethod).toBeDefined();
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

  it("should create a payment method with minimal data", async () => {
    await runWithTestDb(async (db: DB) => {
      const user = await userTestFactory.insertOne(db, {
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

      const paymentMethodData = paymentMethodTestFactory.buildOne({
        userId: user.id,
        type: "bank_transfer",
        details: {
          email: "test@paypal.com",
        },
        isPrimary: false,
      });

      const result = await createPaymentMethodQuery(db, paymentMethodData);

      expect(result.success).toBe(true);
      expect(result.paymentMethod).toBeDefined();
      expect(result.paymentMethod?.userId).toBe(user.id);
      expect(result.paymentMethod?.type).toBe("paypal");
      expect(result.paymentMethod?.details).toEqual({
        email: "test@paypal.com",
      });
      expect(result.paymentMethod?.isPrimary).toBe(false);
      expect(result.error).toBeUndefined();
    });
  });

  it("should handle invalid user ID gracefully", async () => {
    await runWithTestDb(async (db: DB) => {
      const paymentMethodData = paymentMethodTestFactory.buildOne({
        userId: "non-existent-user-id",
        type: "bank_transfer",
        details: {
          accountNumber: "123456789",
          bankName: "Test Bank",
        },
        isPrimary: false,
      });

      const result = await createPaymentMethodQuery(db, paymentMethodData);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.paymentMethod).toBeUndefined();
    });
  });

  it("should handle missing required fields", async () => {
    await runWithTestDb(async (db: DB) => {
      const user = await userTestFactory.insertOne(db, {
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

      const paymentMethodData = paymentMethodTestFactory.buildOne({
        userId: user.id,
        type: "bank_transfer",
        details: {}, // Empty details should fail
        isPrimary: false,
      });

      const result = await createPaymentMethodQuery(db, paymentMethodData);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.paymentMethod).toBeUndefined();
    });
  });

  it("should create multiple payment methods for the same user", async () => {
    await runWithTestDb(async (db: DB) => {
      const user = await userTestFactory.insertOne(db, {
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

      const paymentMethod1Data = paymentMethodTestFactory.buildOne({
        userId: user.id,
        type: "bank_transfer",
        details: {
          accountNumber: "111111111",
          bankName: "First Bank",
        },
        isPrimary: true,
      });

      const paymentMethod2Data = paymentMethodTestFactory.buildOne({
        userId: user.id,
        type: "bank_transfer",
        details: {
          email: "test@paypal.com",
        },
        isPrimary: false,
      });

      const result1 = await createPaymentMethodQuery(db, paymentMethod1Data);
      const result2 = await createPaymentMethodQuery(db, paymentMethod2Data);

      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);
      expect(result1.paymentMethod?.type).toBe("bank_transfer");
      expect(result2.paymentMethod?.type).toBe("paypal");
      expect(result1.paymentMethod?.isPrimary).toBe(true);
      expect(result2.paymentMethod?.isPrimary).toBe(false);
    });
  });

  it("should handle different payment method types", async () => {
    await runWithTestDb(async (db: DB) => {
      const user = await userTestFactory.insertOne(db, {
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

      const bankTransferData = paymentMethodTestFactory.buildOne({
        userId: user.id,
        type: "bank_transfer",
        details: {
          accountNumber: "222222222",
          bankName: "Bank Transfer Bank",
        },
        isPrimary: false,
      });

      const paypalData = paymentMethodTestFactory.buildOne({
        userId: user.id,
        type: "bank_transfer",
        details: {
          email: "test2@paypal.com",
        },
        isPrimary: false,
      });

      const result1 = await createPaymentMethodQuery(db, bankTransferData);
      const result2 = await createPaymentMethodQuery(db, paypalData);

      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);
      expect(result1.paymentMethod?.type).toBe("bank_transfer");
      expect(result2.paymentMethod?.type).toBe("paypal");
    });
  });

  it("should handle complex payment method details", async () => {
    await runWithTestDb(async (db: DB) => {
      const user = await userTestFactory.insertOne(db, {
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

      const paymentMethodData = paymentMethodTestFactory.buildOne({
        userId: user.id,
        type: "bank_transfer",
        details: complexDetails,
        isPrimary: false,
      });

      const result = await createPaymentMethodQuery(db, paymentMethodData);

      expect(result.success).toBe(true);
      expect(result.paymentMethod).toBeDefined();
      expect(result.paymentMethod?.details).toEqual(complexDetails);
      expect(result.error).toBeUndefined();
    });
  });

  it("should handle crypto payment method", async () => {
    await runWithTestDb(async (db: DB) => {
      const user = await userTestFactory.insertOne(db, {
        id: "test-user-id-7",
        name: "Test User 7",
        email: "test7@example.com",
        emailVerified: true,
        image: "https://example.com/avatar7.jpg",
        reputationScore: "700",
        role: "user",
        preferredCurrency: "USD",
        notificationPreferences: { email: true, sms: false, push: true },
      });

      const cryptoDetails = {
        walletAddress: "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
        currency: "BTC",
        network: "bitcoin",
      };

      const paymentMethodData = paymentMethodTestFactory.buildOne({
        userId: user.id,
        type: "bank_transfer",
        details: cryptoDetails,
        isPrimary: false,
      });

      const result = await createPaymentMethodQuery(db, paymentMethodData);

      expect(result.success).toBe(true);
      expect(result.paymentMethod).toBeDefined();
      expect(result.paymentMethod?.type).toBe("crypto");
      expect(result.paymentMethod?.details).toEqual(cryptoDetails);
      expect(result.error).toBeUndefined();
    });
  });
});

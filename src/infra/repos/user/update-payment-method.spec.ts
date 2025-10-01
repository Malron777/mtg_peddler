import { userTestFactory } from "@/src/domain/auth/user.model.test-factory";
import { paymentMethodTestFactory } from "@/src/domain/tcg/payment-method.model.test-factory";
import { buildRunWithTestDb, migrateTestDb } from "@/test-db";
import { beforeAll, describe, expect, it } from "vitest";
import { DB } from "../../db/db";
import { updatePaymentMethodQuery } from "./update-payment-method.query";

describe("updatePaymentMethodQuery", () => {
  let runWithTestDb: Awaited<ReturnType<typeof buildRunWithTestDb>>;

  beforeAll(async () => {
    await migrateTestDb();
    runWithTestDb = await buildRunWithTestDb();
  });

  it("should successfully update an existing payment method", async () => {
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
          bankName: "Original Bank",
        },
        isPrimary: false,
      });

      const updateData = {
        id: paymentMethod.id,
        type: "bank_transfer" as const,
        details: {
          email: "updated@paypal.com",
        },
        isPrimary: true,
      };

      const result = await updatePaymentMethodQuery(db, updateData);

      expect(result.id).toBe(paymentMethod.id);
      expect(result.type).toBe("bank_transfer");
      expect(result.details).toEqual({
        email: "updated@paypal.com",
      });
      expect(result.isPrimary).toBe(true);
      expect(result.userId).toBe(paymentMethod.userId); // Should remain unchanged
      expect(result.updatedAt).toBeDefined();
      expect(result.updatedAt.getTime()).toBeGreaterThan(
        paymentMethod.updatedAt.getTime()
      );
    });
  });

  it("should return undefined when trying to update non-existent payment method", async () => {
    await runWithTestDb(async (db: DB) => {
      const updateData = {
        id: "non-existent-payment-method-id",
        type: "bank_transfer" as const,
        details: {
          email: "test@paypal.com",
        },
        isPrimary: true,
      };

      const result = await updatePaymentMethodQuery(db, updateData);

      expect(result).toBeUndefined();
    });
  });

  it("should handle partial updates correctly", async () => {
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

      const paymentMethod = await paymentMethodTestFactory.insertOne(db, {
        userId: user.id,
        type: "bank_transfer",
        details: {
          accountNumber: "111111111",
          bankName: "Test Bank",
        },
        isPrimary: false,
      });

      const updateData = {
        id: paymentMethod.id,
        isPrimary: true,
      };

      const result = await updatePaymentMethodQuery(db, updateData);

      expect(result.id).toBe(paymentMethod.id);
      expect(result.isPrimary).toBe(true);
      expect(result.type).toBe(paymentMethod.type); // Should remain unchanged
      expect(result.details).toEqual(paymentMethod.details); // Should remain unchanged
      expect(result.userId).toBe(paymentMethod.userId); // Should remain unchanged
      expect(result.updatedAt).toBeDefined();
    });
  });

  it("should handle empty update data gracefully", async () => {
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

      const paymentMethod = await paymentMethodTestFactory.insertOne(db, {
        userId: user.id,
        type: "bank_transfer",
        details: {
          accountNumber: "222222222",
          bankName: "Test Bank",
        },
        isPrimary: false,
      });

      const updateData = {
        id: paymentMethod.id,
      };

      const result = await updatePaymentMethodQuery(db, updateData);

      expect(result.id).toBe(paymentMethod.id);
      expect(result.type).toBe(paymentMethod.type); // Should remain unchanged
      expect(result.details).toEqual(paymentMethod.details); // Should remain unchanged
      expect(result.isPrimary).toBe(paymentMethod.isPrimary); // Should remain unchanged
      expect(result.userId).toBe(paymentMethod.userId); // Should remain unchanged
      expect(result.updatedAt).toBeDefined();
    });
  });

  it("should update payment method type", async () => {
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

      const paymentMethod = await paymentMethodTestFactory.insertOne(db, {
        userId: user.id,
        type: "bank_transfer",
        details: {
          accountNumber: "333333333",
          bankName: "Bank Transfer Bank",
        },
        isPrimary: false,
      });

      const updateData = {
        id: paymentMethod.id,
        type: "bank_transfer" as const,
        details: {
          walletAddress: "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
          currency: "BTC",
          network: "bitcoin",
        },
      };

      const result = await updatePaymentMethodQuery(db, updateData);

      expect(result.id).toBe(paymentMethod.id);
      expect(result.type).toBe("bank_transfer");
      expect(result.details).toEqual({
        walletAddress: "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
        currency: "BTC",
        network: "bitcoin",
      });
      expect(result.isPrimary).toBe(paymentMethod.isPrimary); // Should remain unchanged
      expect(result.userId).toBe(paymentMethod.userId); // Should remain unchanged
      expect(result.updatedAt).toBeDefined();
    });
  });

  it("should update payment method with complex details", async () => {
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

      const paymentMethod = await paymentMethodTestFactory.insertOne(db, {
        userId: user.id,
        type: "bank_transfer",
        details: {
          accountNumber: "444444444",
          bankName: "Simple Bank",
        },
        isPrimary: false,
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

      const updateData = {
        id: paymentMethod.id,
        details: complexDetails,
      };

      const result = await updatePaymentMethodQuery(db, updateData);

      expect(result.id).toBe(paymentMethod.id);
      expect(result.details).toEqual(complexDetails);
      expect(result.type).toBe(paymentMethod.type); // Should remain unchanged
      expect(result.isPrimary).toBe(paymentMethod.isPrimary); // Should remain unchanged
      expect(result.userId).toBe(paymentMethod.userId); // Should remain unchanged
      expect(result.updatedAt).toBeDefined();
    });
  });

  it("should update primary status", async () => {
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
        type: "bank_transfer" as const,
        details: {
          email: "test@paypal.com",
        },
        isPrimary: false,
      });

      const updateData = {
        id: paymentMethod.id,
        isPrimary: true,
      };

      const result = await updatePaymentMethodQuery(db, updateData);

      expect(result.id).toBe(paymentMethod.id);
      expect(result.isPrimary).toBe(true);
      expect(result.type).toBe(paymentMethod.type); // Should remain unchanged
      expect(result.details).toEqual(paymentMethod.details); // Should remain unchanged
      expect(result.userId).toBe(paymentMethod.userId); // Should remain unchanged
      expect(result.updatedAt).toBeDefined();
    });
  });

  it("should handle invalid update data", async () => {
    await runWithTestDb(async (db: DB) => {
      const user = await userTestFactory.buildAndInsertOne(db, {
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

      const paymentMethod = await paymentMethodTestFactory.insertOne(db, {
        userId: user.id,
        type: "bank_transfer",
        details: {
          accountNumber: "777777777",
          bankName: "Test Bank",
        },
        isPrimary: false,
      });

      const updateData = {
        id: paymentMethod.id,
        type: "bank_transfer" as const,
        details: {},
        isPrimary: null as unknown as boolean,
      };

      await expect(updatePaymentMethodQuery(db, updateData)).rejects.toThrow();
    });
  });
});

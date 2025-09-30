import { paymentMethods } from "@/src/infra/db/schema";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import z from "zod";

export const paymentMethodSchema = createSelectSchema(paymentMethods);
export const insertPaymentMethodSchema = createInsertSchema(paymentMethods);

export type PaymentMethod = z.infer<typeof paymentMethodSchema>;

export const updatePaymentMethodSchema = insertPaymentMethodSchema.omit({
  createdAt: true,
  updatedAt: true,
});

export type UpdatePaymentMethod = z.infer<typeof updatePaymentMethodSchema>;

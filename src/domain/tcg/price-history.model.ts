import { priceHistory } from "@/src/infra/db/schema";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import z from "zod";

export const priceHistorySchema = createSelectSchema(priceHistory);
export const insertPriceHistorySchema = createInsertSchema(priceHistory);

export type PriceHistory = z.infer<typeof priceHistorySchema>;
export type InsertPriceHistory = z.infer<typeof insertPriceHistorySchema>;

export const updatePriceHistorySchema = insertPriceHistorySchema
  .omit({
    createdAt: true,
  })
  .partial()
  .required({
    id: true,
  });

export type UpdatePriceHistory = z.infer<typeof updatePriceHistorySchema>;

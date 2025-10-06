import { dealItems } from "@/src/infra/db/schema";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import z from "zod";

export const dealItemSchema = createSelectSchema(dealItems);
export const insertDealItemSchema = createInsertSchema(dealItems);

export type DealItem = z.infer<typeof dealItemSchema>;

export const updateDealItemSchema = insertDealItemSchema
  .omit({
    createdAt: true,
    updatedAt: true,
  })
  .partial()
  .required({
    id: true,
  });

export type UpdateDealItem = z.infer<typeof updateDealItemSchema>;

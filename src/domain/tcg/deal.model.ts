import { deals } from "@/src/infra/db/schema";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import z from "zod";

export const dealSchema = createSelectSchema(deals);
export const insertDealSchema = createInsertSchema(deals);

export type Deal = z.infer<typeof dealSchema>;

export const updateDealSchema = insertDealSchema
  .omit({
    createdAt: true,
    updatedAt: true,
  })
  .partial()
  .required({
    id: true,
  });

export type UpdateDeal = z.infer<typeof updateDealSchema>;

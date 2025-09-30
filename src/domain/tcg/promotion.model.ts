import { promotions } from "@/src/infra/db/schema";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import z from "zod";

export const promotionSchema = createSelectSchema(promotions);
export const insertPromotionSchema = createInsertSchema(promotions);

export type Promotion = z.infer<typeof promotionSchema>;

export const updatePromotionSchema = insertPromotionSchema.omit({
  createdAt: true,
  updatedAt: true,
});

export type UpdatePromotion = z.infer<typeof updatePromotionSchema>;

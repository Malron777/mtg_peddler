import { cards } from "@/src/infra/db/schema";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import z from "zod";

export const cardSchema = createSelectSchema(cards);
export const insertCardSchema = createInsertSchema(cards);

export type Card = z.infer<typeof cardSchema>;

export const updateCardSchema = insertCardSchema.omit({
  createdAt: true,
  updatedAt: true,
});

export type UpdateCard = z.infer<typeof updateCardSchema>;

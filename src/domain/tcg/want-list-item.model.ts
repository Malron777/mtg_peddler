import { wantListItems } from "@/src/infra/db/schema";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import z from "zod";

export const wantListItemSchema = createSelectSchema(wantListItems);
export const insertWantListItemSchema = createInsertSchema(wantListItems);

export type WantListItem = z.infer<typeof wantListItemSchema>;
export type InsertWantListItem = z.infer<typeof insertWantListItemSchema>;

export const updateWantListItemSchema = insertWantListItemSchema.omit({
  createdAt: true,
  updatedAt: true,
});

export type UpdateWantListItem = z.infer<typeof updateWantListItemSchema>;

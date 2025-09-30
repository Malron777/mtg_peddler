import { collectionItems } from "@/src/infra/db/schema";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import z from "zod";

export const collectionItemSchema = createSelectSchema(collectionItems);
export const insertCollectionItemSchema = createInsertSchema(collectionItems);

export type CollectionItem = z.infer<typeof collectionItemSchema>;
export type InsertCollectionItem = z.infer<typeof insertCollectionItemSchema>;

export const updateCollectionItemSchema = insertCollectionItemSchema.omit({
  createdAt: true,
  updatedAt: true,
});

export type UpdateCollectionItem = z.infer<typeof updateCollectionItemSchema>;

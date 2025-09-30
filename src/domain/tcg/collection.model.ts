import { collections } from "@/src/infra/db/schema";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import z from "zod";

export const collectionSchema = createSelectSchema(collections);
export const insertCollectionSchema = createInsertSchema(collections);

export type Collection = z.infer<typeof collectionSchema>;

export const updateCollectionSchema = insertCollectionSchema.omit({
  createdAt: true,
  updatedAt: true,
});

export type UpdateCollection = z.infer<typeof updateCollectionSchema>;

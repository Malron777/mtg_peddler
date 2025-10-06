import { stores } from "@/src/infra/db/schema";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import z from "zod";

export const storeSchema = createSelectSchema(stores);
export const insertStoreSchema = createInsertSchema(stores);

export type Store = z.infer<typeof storeSchema>;
export type InsertStore = z.infer<typeof insertStoreSchema>;

export const updateStoreSchema = insertStoreSchema
  .omit({
    createdAt: true,
    updatedAt: true,
  })
  .partial()
  .required({
    id: true,
  });

export type UpdateStore = z.infer<typeof updateStoreSchema>;

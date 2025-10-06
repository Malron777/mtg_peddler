import { wantLists } from "@/src/infra/db/schema";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import z from "zod";

export const wantListSchema = createSelectSchema(wantLists);
export const insertWantListSchema = createInsertSchema(wantLists);

export type WantList = z.infer<typeof wantListSchema>;
export type InsertWantList = z.infer<typeof insertWantListSchema>;

export const updateWantListSchema = insertWantListSchema
  .omit({
    createdAt: true,
    updatedAt: true,
  })
  .partial()
  .required({
    id: true,
  });

export type UpdateWantList = z.infer<typeof updateWantListSchema>;

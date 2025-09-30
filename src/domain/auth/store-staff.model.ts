import { storeStaff } from "@/src/infra/db/schema";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import z from "zod";

export const storeStaffSchema = createSelectSchema(storeStaff);
export const insertStoreStaffSchema = createInsertSchema(storeStaff);

export type StoreStaff = z.infer<typeof storeStaffSchema>;
export type InsertStoreStaff = z.infer<typeof insertStoreStaffSchema>;

export const updateStoreStaffSchema = insertStoreStaffSchema.omit({
  createdAt: true,
  updatedAt: true,
});

export type UpdateStoreStaff = z.infer<typeof updateStoreStaffSchema>;

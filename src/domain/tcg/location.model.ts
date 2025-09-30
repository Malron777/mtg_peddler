import { locations } from "@/src/infra/db/schema";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import z from "zod";

export const locationSchema = createSelectSchema(locations);
export const insertLocationSchema = createInsertSchema(locations);

export type Location = z.infer<typeof locationSchema>;
export type InsertLocation = z.infer<typeof insertLocationSchema>;

export const updateLocationSchema = insertLocationSchema.omit({
  createdAt: true,
  updatedAt: true,
});

export type UpdateLocation = z.infer<typeof updateLocationSchema>;

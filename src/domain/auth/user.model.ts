import { user } from "@/src/infra/db/schema";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import z from "zod";

export const userSchema = createSelectSchema(user);
export const insertUserSchema = createInsertSchema(user);

export type User = z.infer<typeof userSchema>;

export const updateUserSchema = insertUserSchema.omit({
  createdAt: true,
  updatedAt: true,
  email: true,
  emailVerified: true,
});

export type UpdateUser = z.infer<typeof updateUserSchema>;

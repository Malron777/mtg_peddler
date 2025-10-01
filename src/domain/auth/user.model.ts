import { user } from "@/src/infra/db/schema";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import z from "zod";

export const userSchema = createSelectSchema(user);
export const insertUserSchema = createInsertSchema(user).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type User = z.infer<typeof userSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;

export const updateUserSchema = userSchema
  .omit({
    createdAt: true,
    updatedAt: true,
    email: true,
    emailVerified: true,
  })
  .partial()
  .required({
    id: true,
  });

export type UpdateUser = z.infer<typeof updateUserSchema>;

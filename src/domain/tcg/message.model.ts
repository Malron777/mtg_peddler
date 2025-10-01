import { messages } from "@/src/infra/db/schema";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import z from "zod";

export const messageSchema = createSelectSchema(messages);
export const insertMessageSchema = createInsertSchema(messages);

export type Message = z.infer<typeof messageSchema>;
export type InsertMessage = z.infer<typeof insertMessageSchema>;

export const updateMessageSchema = insertMessageSchema
  .omit({
    createdAt: true,
    updatedAt: true,
  })
  .partial()
  .required({
    id: true,
  });

export type UpdateMessage = z.infer<typeof updateMessageSchema>;

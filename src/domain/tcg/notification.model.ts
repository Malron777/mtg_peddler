import { notifications } from "@/src/infra/db/schema";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import z from "zod";

export const notificationSchema = createSelectSchema(notifications);
export const insertNotificationSchema = createInsertSchema(notifications);

export type Notification = z.infer<typeof notificationSchema>;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;

export const updateNotificationSchema = insertNotificationSchema
  .omit({
    createdAt: true,
    updatedAt: true,
  })
  .partial()
  .required({
    id: true,
  });

export type UpdateNotification = z.infer<typeof updateNotificationSchema>;

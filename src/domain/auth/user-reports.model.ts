import { userReports } from "@/src/infra/db/schema";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import z from "zod";

export const userReportSchema = createSelectSchema(userReports);
export const insertUserReportSchema = createInsertSchema(userReports);

export type UserReport = z.infer<typeof userReportSchema>;

export const updateUserReportSchema = insertUserReportSchema.omit({
  createdAt: true,
  updatedAt: true,
});

export type UpdateUserReport = z.infer<typeof updateUserReportSchema>;

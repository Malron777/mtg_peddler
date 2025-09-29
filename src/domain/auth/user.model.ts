import { user } from "@/src/infra/db/schema";
import z from "zod";

export const userSchema = user.$inferInsert;

export type User = z.infer<typeof userSchema>;

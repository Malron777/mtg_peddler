"use server";

import { User } from "@/src/domain/auth/user.model";
import { headers } from "next/headers";
import { auth } from "./auth";

export async function getCurrentUser(): Promise<User | null> {
  const session = await auth.api.getSession({ headers: await headers() });
  const u = session?.user;
  if (u === undefined || u === null) return null;

  return {
    ...u,
    image: u.image ?? null,
  };
}

export async function isLoggedIn(): Promise<boolean> {
  return !!(await getCurrentUser());
}

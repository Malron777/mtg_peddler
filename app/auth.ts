"use server";

import { dependencies } from "@/src/config/dependencies";
import { User } from "@/src/domain/auth/user.model";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { headers } from "next/headers";

export const auth = betterAuth({
  database: drizzleAdapter(dependencies.db, {
    provider: "pg",
  }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    //   github: {
    //     clientId: dependencies.config.GITHUB_CLIENT_ID,
    //     clientSecret: dependencies.config.GITHUB_CLIENT_SECRET,
    //   },
    google: {
      clientId: dependencies.config.GOOGLE_CLIENT_ID,
      clientSecret: dependencies.config.GOOGLE_CLIENT_SECRET,
      // scope: [
      //   "https://www.googleapis.com/auth/userinfo.profile",
      //   "https://www.googleapis.com/auth/userinfo.email",
      //   "https://www.googleapis.com/auth/gmail.readonly",
      // ],
      // prompt: "consent",
      // accessType: "offline",
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
});

export async function getCurrentUser(): Promise<User | null> {
  const session = await auth.api.getSession({ headers: await headers() });
  const u = session?.user;
  if (u === undefined || u === null) return null;

  return {
    id: u.id,
    name: u.name,
    email: u.email,
    image: u.image ?? undefined,
  };
}

export async function isLoggedIn(): Promise<boolean> {
  return !!(await getCurrentUser());
}

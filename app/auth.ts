import { dependencies } from "@/src/config/dependencies";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

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

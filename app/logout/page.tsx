import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "../auth";

export default async function LogoutPage() {
  await auth.api.signOut({ headers: await headers() });
  redirect("/");
}

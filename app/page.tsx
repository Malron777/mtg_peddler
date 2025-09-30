import { redirect } from "next/navigation";
import { isLoggedIn } from "./auth-actions";

export default async function Home() {
  const loggedIn = await isLoggedIn();

  if (loggedIn) {
    redirect("/dashboard");
  }

  redirect("/sign-in");
}

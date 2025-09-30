import { redirect } from "next/navigation";
import { isLoggedIn } from "./auth";

export default async function Home() {
  const loggedIn = await isLoggedIn();

  if (loggedIn) {
    redirect("/dashboard");
  }

  redirect("/sign-in");
}

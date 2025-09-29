import { redirect } from "next/navigation";
import SignIn from "./_components/sign-in";
import { isLoggedIn } from "./auth";

export default async function Home() {
  const loggedIn = await isLoggedIn();

  if (loggedIn) {
    redirect("/dashboard");
  }

  return <SignIn />;
}

import Navbar from "./_components/navbar";
import SignIn from "./_components/sign-in";
import "./_styles/globals.css";
import { isLoggedIn } from "./auth";

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const loggedIn = await isLoggedIn();

  return (
    <html lang="en">
      <body>
        {/* <div className="mx-auto w-full max-w-6xl grow bg-gray-100"> */}
        <Navbar />
        {loggedIn ? children : <SignIn />}
        {/* </div> */}
      </body>
    </html>
  );
}

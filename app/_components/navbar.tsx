import { Button } from "@/components/ui/button";
import Link from "next/link";
import { RxHamburgerMenu } from "react-icons/rx";
import { getCurrentUser } from "../auth-actions";
import Avatar from "./avatar";

export default async function Navbar() {
  const user = await getCurrentUser();

  return (
    <div className="bg-brown-primary p-3">
      <div className="grid grid-cols-3 grid-rows-1 ">
        <p className="col-start-2 self-center place-self-center">
          Welcome MTG Peddler
        </p>
        <div className="place-self-end">
          <div className="flex gap-4">
            {user ? (
              <div className="flex gap-6 items-center">
                <Avatar />
                <Link href="/logout">
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-black text-white border-none hover:bg-gray-800 hover:text-white"
                  >
                    Logout
                  </Button>
                </Link>
                <button className="mr-6">
                  <RxHamburgerMenu size="2em" />
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Link href="/sign-in">
                  <Button variant="outline" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link href="/sign-up">
                  <Button size="sm">Sign Up</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

import { RxHamburgerMenu } from "react-icons/rx";
import AppIcon from "./app-icon";

export default function Navbar() {
  return (
    <div className="bg-brown-primary p-3">
      <div className="grid grid-cols-3 grid-rows-1 ">
        <p className="col-start-2 self-center place-self-center">
          Welcome MTG Peddler
        </p>
        <div className="place-self-end">
          <div className="flex gap-4">
            <AppIcon />
            <button className="mr-6">
              <RxHamburgerMenu size="2em" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

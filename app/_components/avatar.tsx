import Image from "next/image";
import froggy from "../../froggy.png";

export default function AppIcon() {
  return (
    <Image
      alt=""
      src={froggy}
      className="bg-green-200 w-15 h-15 border-4 border-black rounded-full"
    ></Image>
  );
}

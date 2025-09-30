import Image from "next/image";
import Link from "next/link";
import froggy from "../../froggy.png";

export default function Avatar() {
  return (
    <Link href="/profile">
      <Image
        alt="Profile"
        src={froggy}
        className="bg-green-200 w-15 h-15 border-4 border-black rounded-full hover:opacity-80 transition-opacity cursor-pointer"
      />
    </Link>
  );
}

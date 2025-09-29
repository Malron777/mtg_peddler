import { redirect } from "next/navigation";

export default async function Home() {
  redirect("/dashboard");

  return (
    <div className="flex flex-col items-center align-middle w-full">
      <p>HoMe PaGe</p>
    </div>
  );
}

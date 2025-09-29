"use client";

import { redirect } from "next/navigation";
import { ChangeEventHandler, useState } from "react";
import { authClient } from "../lib/auth-client";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleEmailChange = (event) => {
    setEmail(event.target.value);
  };

  const handlePasswordChange = (
    event: ChangeEventHandler<HTMLInputElement>
  ) => {
    setPassword(event.target.value);
  };

  return (
    <>
      <div className="flex justify-center h-screen">
        <div className="flex flex-col justify-center items-center">
          <form
            action={async () => {
              const _a = await authClient.signIn.email({
                email: email,
                password: password,
              });
              redirect("/");
            }}
          >
            <div className="flex flex-col items-center w-full p-4 rounded-xl bg-gradient-to-bl from-white to-blue-200">
              <p className="mb-1 text-black">Sign in with email</p>
              <input
                className="p-1 mb-1 bg-gradient-to-bl from-blue-200 to-white border-gray-300 rounded-sm text-black"
                placeholder="Email"
                type="email"
                onChange={() => handleEmailChange}
              />
              <input
                className="p-1 mb-1 bg-gradient-to-bl from-blue-200 to-white border-gray-300 rounded-sm text-black"
                placeholder="Password"
                type="password"
                onChange={() => handlePasswordChange}
              />
              <button
                type="submit"
                className="bg-gradient-to-bl from-blue-200 to-white border-gray-500 border-1 p-2 rounded-2xl text-black mt-2"
              >
                Sign in
              </button>
            </div>
          </form>

          <form
            className="mt-4"
            action={async () => {
              await authClient.signIn.social({
                provider: "google",
              });
              redirect("/");
            }}
          >
            <button
              type="submit"
              className="bg-gradient-to-bl from-blue-200 to-white border-gray-500 border-1 p-2 rounded-2xl mb-10 text-black"
            >
              Sign in with Google
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

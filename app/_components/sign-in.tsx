"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { authClient } from "../lib/auth-client";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
  };

  const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await authClient.signIn.email({
        email: email,
        password: password,
      });
      window.location.href = "/dashboard";
    } catch (error) {
      console.error("Sign in failed:", error);
    }
  };

  const handleGoogleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await authClient.signIn.social({
        provider: "google",
      });
      window.location.href = "/dashboard";
    } catch (error) {
      console.error("Google sign in failed:", error);
    }
  };

  return (
    <>
      <div className="flex justify-center h-screen">
        <div className="flex flex-col justify-center items-center">
          <form onSubmit={handleEmailSignIn}>
            <div className="flex flex-col items-center w-full p-4 rounded-xl bg-green-primary border-1 border-green-100">
              <p className="mb-1 text-black">Sign in with email</p>
              <input
                className="p-1 mb-1 bg-gradient-to-bl from-green-100 to-white border-green-100 rounded-sm text-black"
                placeholder="Email"
                type="email"
                value={email}
                onChange={handleEmailChange}
              />
              <input
                className="p-1 mb-1 bg-gradient-to-bl from-green-100 to-white border-green-100 rounded-sm text-black"
                placeholder="Password"
                type="password"
                value={password}
                onChange={handlePasswordChange}
              />
              <button
                type="submit"
                className="border-green-100 border-1 p-1 pl-3 pr-3 rounded-xl text-black mt-2 bg-green-100"
              >
                Sign in
              </button>
            </div>
          </form>

          <form className="mt-4" onSubmit={handleGoogleSignIn}>
            <button
              type="submit"
              className="bg-green-primary border-green-100 border-1 p-2 rounded-xl mb-10 text-black"
            >
              Sign in with Google
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

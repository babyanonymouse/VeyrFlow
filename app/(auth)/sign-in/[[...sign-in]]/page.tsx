"use client";

import dynamic from "next/dynamic";

const SignIn = dynamic(() => import("@clerk/nextjs").then((mod) => mod.SignIn), { ssr: false });

export default function SignInPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950">
      <SignIn />
    </main>
  );
}

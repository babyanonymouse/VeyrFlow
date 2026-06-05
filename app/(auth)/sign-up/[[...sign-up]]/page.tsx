"use client";

import dynamic from "next/dynamic";

const SignUp = dynamic(() => import("@clerk/nextjs").then((mod) => mod.SignUp), { ssr: false });

export default function SignUpPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950">
      <SignUp />
    </main>
  );
}

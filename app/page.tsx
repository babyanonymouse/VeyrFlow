import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Metadata } from "next";
import { Sparkles, CheckCircle2, Shield, ArrowRight, Lock, Droplet, Zap, Brain } from "lucide-react";
import Logo from "@/components/ui/Logo";

export const metadata: Metadata = {
  title: "VeyrFlow | Build Better Habits",
  description: "VeyrFlow helps you build consistency, track your progress, and take control of your daily routines with a beautiful, distraction-free interface.",
  openGraph: {
    title: "VeyrFlow | Build Better Habits",
    description: "VeyrFlow helps you build consistency, track your progress, and take control of your daily routines.",
    type: "website",
    url: "https://habit-flow-pink.vercel.app/",
    siteName: "VeyrFlow",
  },
};

export default async function LandingPage() {
  const { userId } = await auth();

  // "Zero-Drag" Redirect to Dashboard immediately
  if (userId) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-zinc-950 font-sans text-zinc-100 selection:bg-teal-500/30 overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 py-4 backdrop-blur-md bg-zinc-950/60 border-b border-white/5">
        <div className="flex items-center gap-2">
          <Logo size={20} id="landing-nav" />
          <span className="font-bold text-lg tracking-tight text-white">VeyrFlow</span>
        </div>
        <div className="flex items-center gap-6 text-sm font-medium">
          <Link href="/docs" className="text-zinc-400 hover:text-white transition-colors">
            Docs
          </Link>
          <Link href="/sign-in" className="text-zinc-400 hover:text-white transition-colors">
            Log In
          </Link>
          <Link
            href="/sign-up"
            className="rounded-full bg-white text-black px-4 py-2 hover:bg-zinc-200 transition-colors"
          >
            Sign Up
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 px-6 overflow-hidden flex flex-col items-center">
        {/* Abstract Glows */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-75 h-75 sm:w-125 sm:h-125 bg-indigo-600/25 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 translate-x-1/4 -translate-y-1/4 w-62.5 h-62.5 sm:w-100 sm:h-100 bg-teal-600/15 blur-[100px] rounded-full pointer-events-none" />

        <div className="relative mx-auto max-w-4xl text-center z-10 flex flex-col items-center">

          {/* Version 2.0 Pulse Badge */}
          <div className="inline-flex items-center justify-center gap-2 px-3 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/20 mb-8 backdrop-blur-sm">
            <span className="relative flex w-2 h-2">
              <span className="absolute inline-flex w-full h-full rounded-full opacity-75 animate-ping bg-teal-400"></span>
              <span className="relative inline-flex w-2 h-2 rounded-full bg-teal-500"></span>
            </span>
            <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-teal-400">Version 2.0 Now Live</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight text-transparent bg-clip-text bg-linear-to-br from-white to-zinc-500 mb-6 drop-shadow-sm leading-tight">
            Master your habits.<br />Achieve your goals.
          </h1>
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-zinc-400 mb-10 leading-relaxed px-4">
            Experience the kinetic void. A distraction-free environment
            engineered for high-performance individuals who demand precision in
            their daily routines.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
            <Link
              href="/sign-up"
              className="group flex items-center justify-center gap-2 rounded-lg bg-linear-to-r from-indigo-600 to-teal-500 hover:from-indigo-500 hover:to-teal-400 text-white px-10 py-4 text-sm font-bold uppercase tracking-wider transition-all shadow-[0_0_40px_-10px_rgba(45,212,191,0.5)] w-full sm:w-auto"
            >
              Start Building Streaks
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/sign-in"
              className="rounded-lg border border-zinc-800 bg-zinc-950/50 backdrop-blur px-10 py-4 text-sm font-bold uppercase tracking-wider text-zinc-300 hover:bg-zinc-900 hover:text-white transition-all w-full sm:w-auto text-center"
            >
              Log In
            </Link>
          </div>
        </div>

        {/* CSS Hybrid App UI Mockup */}
        <div className="relative mx-auto mt-24 max-w-5xl z-10 perspective-[2000px] hidden md:block w-full">
          <div className="rounded-xl ring-1 ring-white/10 bg-zinc-950/90 backdrop-blur-2xl shadow-2xl shadow-teal-500/10 overflow-hidden flex transform transition-transform duration-700 ease-out hover:rotate-x-2 hover:-rotate-y-1 hover:scale-[1.01] origin-bottom h-112.5 group">
            {/* Sidebar Mockup */}
            <div className="flex flex-col w-64 border-r border-white/5 bg-zinc-900/40 p-5 shrink-0">
              <div className="flex items-center gap-3 mb-10 px-2 mt-2">
                <div className="w-7 h-7 rounded bg-linear-to-tr from-indigo-500 to-teal-500 shadow-inner" />
                <div className="h-4 w-24 bg-zinc-800 rounded" />
              </div>
              <div className="space-y-4">
                <div className="h-10 w-full bg-teal-600/10 rounded-md flex items-center px-4 gap-3 border border-teal-500/20">
                  <div className="w-4 h-4 rounded bg-teal-500/50" />
                  <div className="h-3 w-20 bg-teal-400/50 rounded" />
                </div>
                <div className="h-8 w-full rounded-md flex items-center px-4 gap-3">
                  <div className="w-4 h-4 rounded bg-white/5" />
                  <div className="h-3 w-16 bg-white/5 rounded" />
                </div>
                <div className="h-8 w-full rounded-md flex items-center px-4 gap-3">
                  <div className="w-4 h-4 rounded bg-white/5" />
                  <div className="h-3 w-28 bg-white/5 rounded" />
                </div>
              </div>
            </div>

            {/* Main Content Mockup */}
            <div className="flex-1 p-10 relative bg-linear-to-br from-zinc-900/10 to-zinc-950 overflow-hidden">
              <div className="flex items-center justify-between mb-10">
                <div className="flex flex-col gap-2">
                  <div className="h-4 w-24 bg-zinc-800/50 rounded" />
                  <div className="h-8 w-48 bg-white/10 rounded-lg" />
                </div>
                <div className="flex gap-2">
                  <div className="h-10 w-10 bg-white/5 rounded-full" />
                  <div className="h-10 w-10 bg-white/5 rounded-full" />
                </div>
              </div>

              {/* Dynamic Action Cards (From Stitch Mockup) */}
              <div className="grid grid-cols-3 gap-6">
                {/* Hydration */}
                <div className="p-6 rounded-xl bg-zinc-900/50 border border-white/5 hover:border-sky-500/30 transition-colors">
                  <div className="flex justify-between items-start mb-6">
                    <Droplet className="w-6 h-6 text-sky-400" />
                    <span className="text-[10px] font-bold text-sky-400 uppercase tracking-widest">Hydration</span>
                  </div>
                  <div className="text-3xl font-bold text-white mb-4">2.4L</div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-sky-400 w-3/4 rounded-full" />
                  </div>
                </div>

                {/* Deep Work */}
                <div className="p-6 rounded-xl bg-zinc-900/50 border border-white/5 hover:border-amber-500/30 transition-colors">
                  <div className="flex justify-between items-start mb-6">
                    <Zap className="w-6 h-6 text-amber-400" />
                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">Deep Work</span>
                  </div>
                  <div className="text-3xl font-bold text-white mb-4">4.5h</div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-400 w-1/2 rounded-full" />
                  </div>
                </div>

                {/* Meditation */}
                <div className="p-6 rounded-xl bg-zinc-900/50 border border-white/5 hover:border-purple-500/30 transition-colors">
                  <div className="flex justify-between items-start mb-6">
                    <Brain className="w-6 h-6 text-purple-400" />
                    <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest">Meditation</span>
                  </div>
                  <div className="text-3xl font-bold text-white mb-4">20m</div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-400 w-full rounded-full" />
                  </div>
                </div>
              </div>

              {/* Trailing UI elements placeholder to fill vertical space */}
              <div className="mt-8 flex gap-4 opacity-50">
                <div className="h-12 flex-1 bg-white/5 rounded-lg border border-white/5" />
                <div className="h-12 flex-1 bg-white/5 rounded-lg border border-white/5" />
                <div className="h-12 flex-1 bg-white/5 rounded-lg border border-white/5" />
              </div>
            </div>
          </div>

          {/* Overlay gradient to fade out bottom cleanly */}
          <div className="absolute inset-x-0 bottom-0 h-32 bg-linear-to-t from-zinc-950 to-transparent pointer-events-none" />
        </div>
      </section>

      {/* Bento Grid Features */}
      <section className="py-24 px-6 md:px-12 mx-auto max-w-5xl">
        <div className="mb-16 text-center">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4 text-white">Everything you need to succeed.</h2>
          <p className="text-zinc-400 text-lg max-w-xl mx-auto">Built from the ground up to be frictionless, private, and insanely intelligent.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Hero Feature (AI) - Spans 2 columns */}
          <div className="md:col-span-2 relative overflow-hidden rounded-3xl bg-zinc-900/40 border border-white/5 p-8 sm:p-10 group hover:bg-zinc-900/60 transition-colors">
            <div className="absolute -top-10 -right-10 w-64 h-64 bg-teal-500/10 blur-[60px] rounded-full group-hover:bg-teal-500/20 transition-colors" />
            <Sparkles className="w-8 h-8 text-teal-400 mb-6" />
            <h3 className="text-2xl font-bold mb-3 text-zinc-100">AI-Powered Insights</h3>
            <p className="text-zinc-400 max-w-md leading-relaxed">
              VeyrFlow uses advanced on-device AI to analyze your completion rates and automatically adjust your task priorities. Never fall behind on what truly matters. (Coming Sprint 3)
            </p>
          </div>

          {/* Secondary Feature 1 */}
          <div className="rounded-3xl bg-zinc-900/40 border border-white/5 p-8 sm:p-10 hover:bg-zinc-900/60 transition-colors">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mb-6" />
            <h3 className="text-xl font-bold mb-3 text-zinc-100">Zero-Friction</h3>
            <p className="text-zinc-400 leading-relaxed text-sm">
              With quick command modals and instant optimistic UI updates, you spend less time managing tasks and more time doing them.
            </p>
          </div>

          {/* Secondary Feature 2 (Spans 3 cols on desktop) */}
          <div className="md:col-span-3 rounded-3xl bg-linear-to-r from-zinc-900/60 to-zinc-900/20 border border-white/5 p-8 sm:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8 group">
            <div className="max-w-xl">
              <Shield className="w-8 h-8 text-teal-400 mb-6" />
              <h3 className="text-2xl font-bold mb-3 text-zinc-100">Privacy First Architecture</h3>
              <p className="text-zinc-400 leading-relaxed">
                Your data is yours. We offer explicit privacy modes that permanently exclude sensitive tasks from being sent to our AI models for analysis.
              </p>
            </div>
            <div className="shrink-0 p-8 rounded-2xl bg-zinc-950/80 border border-white/5 group-hover:border-teal-500/30 transition-colors shadow-inner">
              <Lock className="w-16 h-16 text-zinc-600 group-hover:text-teal-400 transition-colors" />
            </div>
          </div>
        </div>
      </section>

      {/* Bottom Bento CTA */}
      <section className="pb-24 px-6 md:px-12 mx-auto max-w-5xl">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-8 bg-zinc-900/40 border border-white/5 rounded-3xl p-10 sm:p-12 relative overflow-hidden flex flex-col justify-center group hover:bg-zinc-900/60 transition-colors">
            <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 blur-[80px] rounded-full group-hover:bg-teal-500/20 transition-colors" />
            <h2 className="text-3xl md:text-5xl font-black text-white mb-6 tracking-tight max-w-md leading-tight">
              Ready to enter the void?
            </h2>
            <p className="text-zinc-400 max-w-sm mb-8 leading-relaxed">
              Built for systems thinkers. Designed for zero-drag productivity. Stop playing with toys and start commanding your life.
            </p>
            <div>
              <Link href="/sign-up" className="inline-flex px-8 py-3.5 bg-white text-zinc-950 font-bold rounded-lg uppercase text-xs tracking-widest hover:bg-zinc-200 transition-colors">
                Start Engineering Routines
              </Link>
            </div>
          </div>

          <div className="md:col-span-4 bg-linear-to-br from-indigo-500/20 to-teal-500/25 border border-teal-500/30 rounded-3xl p-10 flex flex-col items-center justify-center text-center gap-4 relative overflow-hidden shadow-inner">
            <Logo size={40} id="landing-card" className="mb-2" />
            <div className="text-4xl sm:text-5xl font-black text-white tracking-tighter">
              100%
            </div>
            <div className="text-teal-300 font-bold uppercase text-[10px] tracking-[0.3em]">
              High-Agency
            </div>
          </div>
        </div>
      </section>

      {/* Expanded Trust Footer */}
      <footer className="border-t border-zinc-800/50 py-12 px-6 text-center text-sm text-zinc-500">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">

          <span className="font-bold text-lg text-white">VeyrFlow</span>

          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8">
            <Link href="/docs" className="font-medium text-xs tracking-widest uppercase text-zinc-400 hover:text-teal-400 transition-colors">Docs</Link>
            <Link href="#" className="font-medium text-xs tracking-widest uppercase text-zinc-400 hover:text-teal-400 transition-colors">Privacy</Link>
            <Link href="#" className="font-medium text-xs tracking-widest uppercase text-zinc-400 hover:text-teal-400 transition-colors">Terms</Link>
            <Link href="#" className="font-medium text-xs tracking-widest uppercase text-zinc-400 hover:text-emerald-400 transition-colors">System Status</Link>
            <Link href="#" className="font-medium text-xs tracking-widest uppercase text-zinc-400 hover:text-teal-400 transition-colors">Contact</Link>
          </div>

          <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-zinc-800/60 bg-zinc-900/30 hover:bg-zinc-900/80 cursor-default transition-colors">
            <Logo size={16} id="landing-footer" />
            <span className="font-semibold text-zinc-300 tracking-wide text-[10px] uppercase">A PeoLabs Project</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

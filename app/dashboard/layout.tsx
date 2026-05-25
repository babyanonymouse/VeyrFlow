import Sidebar from "@/components/ui/Sidebar";
import BottomNav from "@/components/ui/BottomNav";
import { Activity, Settings, BookOpen } from "lucide-react";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-zinc-950">
      {/* Mobile Top Header — hidden on desktop, provides logo, settings, docs, and account */}
      <header className="flex md:hidden items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-950 sticky top-0 z-35 backdrop-blur-md bg-zinc-950/90">
        <Link href="/dashboard" className="flex items-center gap-2 outline-none">
          <Activity className="w-5 h-5 text-indigo-400" />
          <span className="font-bold tracking-tight text-white">HabitFlow</span>
        </Link>
        <div className="flex items-center gap-4.5">
          <Link href="/docs" className="text-zinc-400 hover:text-white transition-colors p-1" title="Docs">
            <BookOpen size={18} />
          </Link>
          <Link href="/dashboard/settings" className="text-zinc-400 hover:text-white transition-colors p-1" title="Settings">
            <Settings size={18} />
          </Link>
          <UserButton />
        </div>
      </header>

      {/* Sticky sidebar — hidden on mobile */}
      <Sidebar />
      
      {/* Main dashboard content area */}
      <main className="flex-1 min-h-screen pb-24 md:pb-0 md:pl-64">
        {children}
      </main>
      
      {/* Bottom nav — visible on mobile only */}
      <BottomNav />
    </div>
  );
}

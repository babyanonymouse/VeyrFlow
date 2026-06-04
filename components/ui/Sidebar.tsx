"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CheckSquare,
  Repeat2,
  Settings,
  BookOpen,
} from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import Logo from "@/components/ui/Logo";

const links = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/tasks", label: "Tasks", icon: CheckSquare },
  { href: "/dashboard/habits", label: "Habits", icon: Repeat2 },
  { href: "/docs", label: "Docs", icon: BookOpen },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

// Exact match for /dashboard root; startsWith for sub-pages like /dashboard/tasks/123
function isActive(path: string, href: string) {
  return href === "/dashboard" ? path === href : path.startsWith(href);
}

export default function Sidebar() {
  const path = usePathname();
  return (
    // z-40 — below modals (z-50) but above page content
    <aside className="fixed hidden md:flex flex-col w-64 h-screen z-40 border-r border-zinc-800 bg-zinc-950 px-4 py-6 gap-1">
      <Link
        href="/dashboard"
        className="flex items-center gap-2.5 px-3 mb-6 outline-none focus:ring-2 focus:ring-teal-500 rounded-md"
      >
        <Logo size={24} id="sidebar" />
        <span className="font-black text-xl tracking-tight text-white">
          VeyrFlow
        </span>
      </Link>

      <nav className="flex-1 flex flex-col gap-1">
        {links.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
              isActive(path, href)
                ? "bg-zinc-900 text-white border border-zinc-800/80"
                : "text-zinc-400 hover:text-white hover:bg-zinc-900/50 border border-transparent"
            }`}
          >
            <Icon size={18} />
            {label}
          </Link>
        ))}
      </nav>

      <div className="border-t border-zinc-800/80 pt-4 px-3 flex items-center gap-3 shrink-0">
        <UserButton />
        <div className="flex flex-col text-left overflow-hidden">
          <span className="text-xs font-bold text-zinc-200 truncate">
            My Account
          </span>
          <span className="text-[10px] text-zinc-500 truncate">
            Manage profile
          </span>
        </div>
      </div>
    </aside>
  );
}

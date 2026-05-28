"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, CheckSquare, Repeat2, Settings } from "lucide-react";

const links = [
  { href: "/dashboard",          icon: LayoutDashboard, label: "Home" },
  { href: "/dashboard/tasks",    icon: CheckSquare,     label: "Tasks" },
  { href: "/dashboard/habits",   icon: Repeat2,         label: "Habits" },
];

function isActive(path: string, href: string) {
  return href === "/dashboard" ? path === href : path.startsWith(href);
}

export default function BottomNav() {
  const path = usePathname();
  return (
    // pb-[env(safe-area-inset-bottom)] clears iPhone/Android home bar
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex md:hidden border-t border-zinc-800 bg-zinc-950 pb-[env(safe-area-inset-bottom)]">
      {links.map(({ href, icon: Icon, label }) => (
        <Link
          key={href}
          href={href}
          className={`flex flex-1 flex-col items-center gap-1 py-3 text-xs transition-colors active:scale-[0.98] transition-transform duration-75 ${
            isActive(path, href) ? "text-white" : "text-zinc-500 hover:text-white"
          }`}
        >
          <Icon size={20} />
          {label}
        </Link>
      ))}
    </nav>
  );
}

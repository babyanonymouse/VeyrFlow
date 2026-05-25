import type { ReactNode } from "react";
import { DocsLayout } from "fumadocs-ui/layouts/docs";
import { RootProvider } from "fumadocs-ui/provider/next";
import { docsSource } from "@/lib/docs-source";
import { Activity } from "lucide-react";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <RootProvider>
      <DocsLayout
        tree={docsSource.pageTree}
        nav={{
          title: (
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-400 animate-pulse" />
              <span className="font-bold text-zinc-100">HabitFlow Docs</span>
            </div>
          ),
        }}
        links={[
          { text: "Dashboard", url: "/dashboard", active: "nested-url" }
        ]}
      >
        {children}
      </DocsLayout>
    </RootProvider>
  );
}

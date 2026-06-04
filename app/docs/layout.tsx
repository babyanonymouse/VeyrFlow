import type { ReactNode } from "react";
import { DocsLayout } from "fumadocs-ui/layouts/docs";
import { RootProvider } from "fumadocs-ui/provider/next";
import { docsSource } from "@/lib/docs-source";
import Logo from "@/components/ui/Logo";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <RootProvider>
      <DocsLayout
        tree={docsSource.pageTree}
        nav={{
          title: (
            <div className="flex items-center gap-2">
              <Logo size={20} id="docs-nav" className="animate-pulse" />
              <span className="font-bold text-zinc-100">VeyrFlow Docs</span>
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

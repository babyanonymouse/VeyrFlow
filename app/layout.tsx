import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Analytics } from "@vercel/analytics/next";
import NextTopLoader from "nextjs-toploader";
import { Toaster } from "sonner";
import SerwistRegistrar from "./serwist/SerwistRegistrar";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HabitFlow",
  description: "A production-grade app to track tasks, habits, and recurring goals.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "HabitFlow",
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#09090b",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // ClerkProvider is outermost — above <html> — to eliminate FOUC
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} bg-zinc-950 antialiased`}
        >
          <NextTopLoader
            color="#818cf8"
            showSpinner={false}
            crawlSpeed={200}
            height={2}
            easing="ease"
            speed={200}
            shadow="0 0 10px #818cf8,0 0 5px #818cf8"
          />
          <SerwistRegistrar>
            {children}
            <Toaster 
              position="top-right" 
              toastOptions={{
                classNames: {
                  toast: 'group flex items-center bg-zinc-950/80 backdrop-blur-xl border border-indigo-500/20 text-zinc-100 shadow-2xl rounded-xl p-4',
                  title: 'text-sm font-medium tracking-wide',
                  description: 'text-xs text-zinc-400',
                  actionButton: 'bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 transition-colors',
                  cancelButton: 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors',
                  success: 'border-l-2 border-l-teal-400/50',
                  error: 'border-l-2 border-l-red-400/50',
                },
              }} 
            />
            <Analytics />
          </SerwistRegistrar>
        </body>
      </html>
    </ClerkProvider>
  );
}

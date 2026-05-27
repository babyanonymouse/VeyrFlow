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
  icons: {
    icon: "/icon-192x192.png",
    shortcut: "/icon-192x192.png",
    apple: "/apple-touch-icon.png",
  },
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
            color="#6366f1"
            showSpinner={false}
            crawlSpeed={200}
            height={3}
            easing="ease"
            speed={200}
            shadow="0 0 10px #6366f1,0 0 5px #6366f1"
          />
          <SerwistRegistrar>
            {children}
            <Toaster richColors position="top-right" />
            <Analytics />
          </SerwistRegistrar>
        </body>
      </html>
    </ClerkProvider>
  );
}

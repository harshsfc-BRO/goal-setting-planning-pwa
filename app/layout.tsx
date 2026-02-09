import type { Metadata, Viewport } from "next";
import { ReactNode } from "react";
import "./globals.css";
import { Nav } from "@/components/nav";
import { AuthGate } from "@/components/auth-gate";

export const metadata: Metadata = {
  title: "Goal Setting & Planning",
  description: "Standalone PWA for goal setting, planning, and weekly reviews.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/icons/icon-192.svg",
    apple: "/icons/icon-192.svg"
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Goal Planner"
  }
};

export const viewport: Viewport = {
  themeColor: "#205f42"
};

export default function RootLayout({
  children
}: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <div className="mx-auto grid max-w-7xl gap-4 p-4 md:grid-cols-[260px_1fr]">
          <aside>
            <Nav />
          </aside>
          <main className="panel p-4">
            <AuthGate>{children}</AuthGate>
          </main>
        </div>
      </body>
    </html>
  );
}

import type { Metadata, Viewport } from "next";
import { Geist_Mono } from "next/font/google";
import "@fontsource-variable/hubot-sans";
import "@fontsource-variable/mona-sans";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { DemoBanner } from "@/components/demo/DemoBanner";
import "@/styles/globals.css";

// Display + body type is Hubot Sans + Mona Sans (GitHub's open variable
// grotesks), self-hosted via @fontsource-variable, matching the marketing
// site so the whole Gravixar fleet reads as one deliberate design system.
// Mono stays Geist Mono (next/font) for labels, numerals, and status pills.
const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Gravixar Demo",
  description:
    "demo.gravixar.com, the capability showroom. Pick the context closest to yours and see what Gravixar builds.",
  // Demo subdomain, discouraged from indexing so keyword juice stays on gravixar.com
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#050508",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={geistMono.variable}
    >
      <body className="bg-[#050508] text-[#f5f5f7]">
        <DemoBanner />
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}

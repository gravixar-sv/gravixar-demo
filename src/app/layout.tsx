import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { DemoBanner } from "@/components/demo/DemoBanner";
import "@/styles/globals.css";

// Geist + Geist Mono replace the previous Inter + Fraunces + JetBrains
// Mono trio. Aligning with the marketing site's typography and dropping
// the editorial-magazine feel (Fraunces) in favour of agency-tech.
// Fewer faces loaded means faster TTFB on the demo subdomain too.
const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  display: "swap",
});
const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Gravixar, demo gallery",
  description:
    "demo.gravixar.com, design + capability showroom. Pick a scene to explore the kinds of systems Gravixar builds.",
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
      className={`${geistSans.variable} ${geistMono.variable}`}
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

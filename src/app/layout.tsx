import type { Metadata, Viewport } from "next";
import { Inter, Fraunces, JetBrains_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { DemoBanner } from "@/components/demo/DemoBanner";
import "@/styles/globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});
const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});
const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
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
      className={`${inter.variable} ${fraunces.variable} ${jetbrains.variable}`}
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

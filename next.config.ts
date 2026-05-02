import type { NextConfig } from "next";
import { withBotId } from "botid/next/config";

const CSP_DIRECTIVES: Record<string, string[]> = {
  "default-src":   ["'self'"],
  "script-src":    ["'self'", "'unsafe-inline'", "https://va.vercel-scripts.com"],
  "style-src":     ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
  "font-src":      ["'self'", "https://fonts.gstatic.com", "data:"],
  "img-src":       ["'self'", "data:", "blob:", "https://*.public.blob.vercel-storage.com"],
  "frame-src":     ["'self'"],
  "connect-src":   ["'self'", "https://*.public.blob.vercel-storage.com", "https://vitals.vercel-insights.com"],
  "object-src":    ["'none'"],
  "base-uri":      ["'self'"],
  "form-action":   ["'self'"],
  "frame-ancestors": ["'none'"],
  "upgrade-insecure-requests": [],
};

const CSP_HEADER = Object.entries(CSP_DIRECTIVES)
  .map(([k, v]) => (v.length ? `${k} ${v.join(" ")}` : k))
  .join("; ");

const SECURITY_HEADERS = [
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options",    value: "nosniff" },
  { key: "X-Frame-Options",           value: "DENY" },
  { key: "Referrer-Policy",           value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy",        value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
  { key: "X-DNS-Prefetch-Control",    value: "off" },
  { key: "Content-Security-Policy",   value: CSP_HEADER },
  // Robots: demo subdomain is for humans, not search engines. Discouraged
  // from indexing so keyword juice stays with the marketing site.
  { key: "X-Robots-Tag",              value: "noindex, nofollow" },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
    ],
  },
  experimental: {
    serverActions: { bodySizeLimit: "5mb" },
  },
  async headers() {
    return [{ source: "/:path*", headers: SECURITY_HEADERS }];
  },
};

export default withBotId(nextConfig);

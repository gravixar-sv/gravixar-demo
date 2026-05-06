// Public-pause middleware. Rewrites every production request to
// /coming-soon while the demo is being polished. To unpause: revert
// the PR that added this file.
//
// Scope: ONLY production (`VERCEL_ENV === "production"`) is paused.
// Vercel preview deployments and local dev stay fully functional, so
// the team can keep iterating and share preview URLs with specific
// people without lifting the public block.

import { NextResponse, type NextRequest } from "next/server";

const COMING_SOON_PATH = "/coming-soon";

export function middleware(request: NextRequest) {
  // Only pause production. Previews + local dev pass through.
  if (process.env.VERCEL_ENV !== "production") {
    return NextResponse.next();
  }

  // Allow the holding page itself, otherwise the rewrite would loop.
  if (request.nextUrl.pathname === COMING_SOON_PATH) {
    return NextResponse.next();
  }

  // Rewrite (not redirect) so the URL bar stays put — visitors who
  // followed a deep link to /lattice or /tour see the holding page
  // at that URL rather than bouncing to a different one.
  const url = request.nextUrl.clone();
  url.pathname = COMING_SOON_PATH;
  return NextResponse.rewrite(url);
}

export const config = {
  // Skip Next internals + common static asset paths. Everything else,
  // including API routes, is paused. APIs aren't reachable while the
  // app pages are paused anyway, so blocking them is consistent.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:png|jpg|jpeg|svg|gif|webp|ico|woff|woff2|ttf|otf)$).*)",
  ],
};

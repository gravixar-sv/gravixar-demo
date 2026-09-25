import { StrictMode } from "react";
import { renderToString } from "react-dom/server";
import { App } from "@/App";
import { NOT_FOUND, ROUTES, type RouteDef } from "@/routes";

export { NOT_FOUND, ROUTES };

const ORIGIN = "https://demo.gravixar.com";

function escape(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/** Title, description and social card tags for one route. */
function head(route: RouteDef): string {
  const url = route.path === "/404" ? ORIGIN : `${ORIGIN}${route.path === "/" ? "" : route.path}`;
  const tags = [
    `<title>${escape(route.title)}</title>`,
    `<meta name="description" content="${escape(route.description)}" />`,
    `<link rel="canonical" href="${url}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="Gravixar Demo" />`,
    `<meta property="og:title" content="${escape(route.title)}" />`,
    `<meta property="og:description" content="${escape(route.description)}" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
  ];
  if (route.image) {
    tags.push(`<meta property="og:image" content="${ORIGIN}${route.image}" />`);
  }
  return tags.join("\n    ");
}

export async function render(route: RouteDef): Promise<{ html: string; head: string }> {
  const Page = await route.load();
  const html = renderToString(
    <StrictMode>
      <App path={route.path}>
        <Page />
      </App>
    </StrictMode>,
  );
  return { html, head: head(route) };
}

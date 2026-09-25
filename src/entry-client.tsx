import "@fontsource-variable/mona-sans/wdth.css";
import "@fontsource-variable/geist-mono";
import "@fontsource/newsreader/latin-400-italic.css";
import "@/styles/globals.css";

import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { App } from "@/App";
import { matchRoute } from "@/routes";

// Production pages arrive prerendered, so the client hydrates the page
// it was served. The dev server sends an empty shell (only the
// <!--app-html--> placeholder comment) for every path,
// so there it renders instead.
const route = matchRoute(window.location.pathname);
const Page = await route.load();
const container = document.getElementById("root")!;
const tree = (
  <StrictMode>
    <App path={route.path}>
      <Page />
    </App>
  </StrictMode>
);

if (container.firstElementChild) {
  hydrateRoot(container, tree);
} else {
  document.title = route.title;
  createRoot(container).render(tree);
}

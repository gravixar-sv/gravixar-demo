// Wrapper that composes the persistent rail + main pane. Used by the
// gallery now (polish session 1); will wrap scene layouts in
// session 2 so chrome stays consistent across surfaces.

import type { ReactNode } from "react";
import { DashboardRail } from "./DashboardRail";

export function DashboardShell({ children }: { children: ReactNode }) {
  return (
    <div className="bg-gallery min-h-[calc(100dvh-40px)]">
      <div className="mx-auto flex max-w-7xl">
        <DashboardRail />
        <main className="min-w-0 flex-1 px-6 py-8 md:px-10 md:py-10 lg:px-12 lg:py-12">
          {children}
        </main>
      </div>
    </div>
  );
}

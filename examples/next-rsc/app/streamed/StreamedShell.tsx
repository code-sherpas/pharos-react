'use client';

import type { ReactNode } from 'react';
import {
  SidePanel,
  SidePanelTrigger,
  SidePanelContent,
  SidePanelHeader,
  SidePanelTitle,
} from '@code-sherpas/pharos-react';

/**
 * The shell of an application whose pages stream: a `<SidePanel>` wraps the
 * header with its trigger, the `<main>` with the page, and the panel. The page
 * arrives later, inside the Suspense boundary of `loading.tsx`.
 */
export function StreamedShell({ children }: { children: ReactNode }) {
  return (
    <SidePanel>
      <div style={{ display: 'flex', minHeight: '100dvh' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <header style={{ padding: 16 }}>
            <SidePanelTrigger>Assistant</SidePanelTrigger>
          </header>
          <main style={{ padding: 16 }}>{children}</main>
        </div>
        <SidePanelContent>
          <SidePanelHeader>
            <SidePanelTitle>Assistant</SidePanelTitle>
          </SidePanelHeader>
          <p>Ask about this page.</p>
        </SidePanelContent>
      </div>
    </SidePanel>
  );
}

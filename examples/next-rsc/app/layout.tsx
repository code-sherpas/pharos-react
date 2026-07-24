import type { ReactNode } from 'react';
// The consumer contract, imported once at the entry — exactly the three lines
// an external consumer writes. Global CSS import from node_modules is allowed
// in the App Router root layout.
import '@code-sherpas/pharos-tokens/css';
import '@code-sherpas/pharos-react/styles.css';

export const metadata = {
  title: 'Pharos RSC harness',
  description: 'Server/client boundary regression net for @code-sherpas/pharos-react (#80).',
};

// A Server Component (no "use client"): if importing Pharos into the RSC graph
// regressed (e.g. the build stopped shipping per-file directives), this file —
// and `next build` — would fail.
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

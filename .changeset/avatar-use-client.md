---
'@code-sherpas/pharos-react': patch
---

Mark the published ESM bundle as client-only via a `"use client"` banner.

Avatar (D14) calls `createContext(...)` three times at module top level
(shape / loading / group). Without the banner, Next.js evaluates the
Pharos module during its RSC build-time analysis pass and fails with
`TypeError: (0 , c.createContext) is not a function` while collecting
page data for any route whose layout transitively imports an Avatar.

The banner is the same convention every React DS ships with
(MUI / Chakra / Radix / shadcn). The atoms that have no hooks
(Card / Separator) lose server-render-ability as a side effect; this is
acceptable since they were never advertised as server-safe and React DS
libraries are universally client-only today.

The Avatar source file also carries its own `"use client"` directive so
the intent is visible to anyone reading the source.

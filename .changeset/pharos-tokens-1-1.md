---
'@code-sherpas/pharos-react': major
---

Requires `@code-sherpas/pharos-tokens` `^1.1.0` (was `^1.0.0`): `SidePanel` reads the panel width and the panel breakpoint that pharos-tokens 1.1.0 publishes (decision D32), and `Sheet` now takes its left and right width from the same `--pharos-width-panel` token instead of a fixed `24rem`. Its value is `24rem`, so nothing changes on screen. Install pharos-tokens 1.1.0 alongside this release: `pnpm add @code-sherpas/pharos-react@^3 @code-sherpas/pharos-tokens@^1.1`.

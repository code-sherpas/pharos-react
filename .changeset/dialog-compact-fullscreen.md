---
'@code-sherpas/pharos-react': major
'@examples/saas-demo': patch
'@examples/next-rsc': patch
---

Requires `@code-sherpas/pharos-tokens` `^1.2.0` (was `^1.1.0`): `Dialog` reads the compact breakpoint that pharos-tokens 1.2.0 publishes (`breakpoint.compact`, 40rem; decision D32). This peer bump is the only breaking change: no component, prop or variant changes. Install pharos-tokens 1.2.0 alongside this release: `pnpm add @code-sherpas/pharos-react@^4 @code-sherpas/pharos-tokens@^1.2`.

`Dialog` fills the screen below the compact width (a phone): no margin, no radius and no shadow, `DialogHeader` pinned at the top and `DialogFooter` at the bottom, and only what lies between them scrolls. A field the keyboard reaches under the pinned header or footer is scrolled clear of them (WCAG 2.4.11). From the breakpoint up it is the centered panel it was in 3.2.1, unchanged. The component reads the breakpoint with `matchMedia` and mirrors the form on `data-pharos-mode` (`centered` or `fullscreen`) on `DialogContent`; crossing the breakpoint with the dialog open, by turning the phone or resizing the window, only restyles the same panel, so what was typed and the focus stay. The modal contract is the same in both forms: focus moves in on open, Escape closes, and focus returns to what opened it. On the server it renders the centered form, and the browser corrects it after hydration. `AlertDialog` is not affected: a confirmation stays centered at every width.

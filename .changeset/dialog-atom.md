---
'@code-sherpas/pharos-react': minor
---

Add `Dialog` — a centered modal panel (the shadcn Dialog contract over Base UI's `Dialog`: focus trap, scroll lock, backdrop, Escape / backdrop-click dismiss, focus return to the trigger).

Compound parts: `Dialog`, `DialogTrigger`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`, `DialogFooter`, `DialogClose`. Sibling of `Sheet` (same Base UI primitive) — Dialog is the centered modal, Sheet the edge-docked panel. `DialogContent` collapses Base UI's `Portal` + `Backdrop` + `Popup` and shares the `--pharos-z-index-popover` overlay layer so a `Select` / `Popover` opened from inside the dialog still stacks above it.

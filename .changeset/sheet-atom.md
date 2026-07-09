---
'@code-sherpas/pharos-react': minor
---

Add `Sheet` — a modal panel that docks to a viewport edge and slides in (the shadcn Sheet contract over Base UI's `Dialog`: focus trap, scroll lock, backdrop, Escape / backdrop-click dismiss, focus return to the trigger).

Compound parts: `Sheet`, `SheetTrigger`, `SheetContent` (with a `side` axis: `top | right | bottom | left`, default `right`), `SheetHeader`, `SheetTitle`, `SheetDescription`, `SheetFooter`, `SheetClose`, plus the `sheetVariants` helper. `SheetContent` collapses Base UI's `Portal` + `Backdrop` + `Popup` and shares the `--pharos-z-index-popover` overlay layer so a `Select` / `Popover` opened from inside the sheet still stacks above it. Distinct from `Popover` (non-modal, anchored) and `DropdownMenu` (menu-button).

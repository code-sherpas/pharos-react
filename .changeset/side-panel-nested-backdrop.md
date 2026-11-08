---
'@code-sherpas/pharos-react': patch
---

`SidePanel` no longer puts the content beside it inside a dialog. A `Sheet`, `Dialog` or `AlertDialog` opened from that content (the report next to the panel) now dims the page with its own backdrop, as on any other page; before, it blocked the page without dimming it, on wide and narrow screens, with the panel open or closed. Only the modal form of `SidePanelContent` is a dialog now. One open state, focus in and back, Escape, and the switch of form at the panel breakpoint (the modal form still slides in when the window narrows) behave as before. A `SheetTrigger` or `SheetClose` placed in that content outside a `<Sheet>` of its own used to attach, unsupported, to the panel's hidden one; it now needs its own `<Sheet>`, like anywhere else.

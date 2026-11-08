---
'@code-sherpas/pharos-react': patch
---

`SidePanel` no longer puts the content beside it inside a dialog. A `Sheet`, `Dialog` or `AlertDialog` opened from that content (the report next to the panel) now dims the page with its own backdrop, as on any other page; before, it blocked the page without dimming it, on wide and narrow screens, with the panel open or closed. Only the modal form of `SidePanelContent` is a dialog now. Nothing else changes: one open state, focus in and back, Escape, and the switch of form at the panel breakpoint behave as before.

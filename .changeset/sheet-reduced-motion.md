---
'@code-sherpas/pharos-react': patch
---

`Sheet` respects `prefers-reduced-motion`: with `reduce`, the panel no longer slides in or out from its edge, on any `side`. It opens and closes in place; the backdrop keeps its opacity fade. `SidePanel`'s modal form, which is a `Sheet`, gets the same behaviour from `Sheet` itself, so its own duplicate rule is gone; nothing changes for it on screen.

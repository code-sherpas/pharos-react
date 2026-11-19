---
'@code-sherpas/pharos-react': minor
---

`Dialog` below `breakpoint.compact` now follows the visual viewport, the part of the page the browser shows. With the on-screen keyboard open, which on iOS Safari and on Chrome for Android covers the window without resizing it, the full-screen panel is as tall as what the keyboard leaves: `DialogFooter` sits right above the keyboard, so «Save» and «Cancel» are reachable without closing it, and the focused field is scrolled into the body that is left, clear of the pinned header and footer. When the keyboard closes the panel takes the whole height back. It also moves with the visual viewport when the browser scrolls it to show a field. A pinch zoom is left to magnify the panel, not refit it. From `breakpoint.compact` up nothing changes, and `AlertDialog` is unchanged. No API change.

---
'@code-sherpas/pharos-react': minor
---

`AlertDialog` gains `pending`, for confirmations whose operation takes time. While it is `true`, nothing closes the confirmation (Escape, Cancel, Action: `onOpenChange` is not called with `false`), `AlertDialogAction` is `aria-disabled` — still focusable, ignoring presses so the operation cannot start twice — with a Spinner hidden from screen readers, `AlertDialogCancel` is `aria-disabled`, and the panel carries `aria-busy`. `AlertDialogAction` now stays open when its `onClick` calls `event.preventDefault()`. The asynchronous pattern: control `open`, call `preventDefault()` and set `pending` in Action's `onClick`, then clear `pending` and close when the operation ends, or keep it open with an error if it fails. Pharos adds no text: the progress message (`role="status"`) and the error with its retry (`role="alert"`) are composed inside the content. Without `pending` nothing changes.

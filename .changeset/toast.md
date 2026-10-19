---
'@code-sherpas/pharos-react': minor
---

New `Toast` (decision D30): `ToastProvider`, `Toaster` and `useToast()` over Base UI's Toast. Brief feedback in a corner — or centred on an edge — that closes on its own after seven seconds, pausing while the pointer or focus is on it. Variants `default | success | info | warning | destructive` as in `Badge`, each but `default` with an icon. The region is a live region from the start, F6 moves focus into it, and the consumer names it and its close buttons (`label`, `closeLabel`). A toast with an `action` stays until closed, and acting on it closes it. Logical `position` (`top-center`, `bottom-end`…), on the toast layer of D29.

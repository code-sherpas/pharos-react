---
'@code-sherpas/pharos-react': patch
---

The primary button is seablue (decision D24). `Button` and `IconButton` with `intent="primary"` now fill with `--pharos-color-primary-600` instead of `neutral-900`, with `primary-700` on hover and `primary-800` when pressed. Blue is the colour of every interaction in Pharos, and the primary action is the one blue anchor of a view; white on `primary-600` is about 6.6:1. The focus ring stays `primary-600`, set apart by its white halo. This is a deliberate visual change: every primary action in an app turns from near-black to blue.

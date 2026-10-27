---
'@code-sherpas/pharos-react': patch
---

`Button` and `IconButton` support being disabled the focusable way (ARIA APG): with `aria-disabled="true"` they look exactly like `disabled` (opacity 0.5, no hover, `not-allowed` cursor) but keep their place in the tab order, so a button that turns busy while it has focus does not drop a keyboard user on `<body>`. A press from the keyboard is ignored: `onClick` is not called and, rendered as a link, it does not navigate.

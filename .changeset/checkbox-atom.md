---
'@code-sherpas/pharos-react': minor
---

Add `Checkbox` — a single square selection control (the shadcn Checkbox contract over Base UI's `Checkbox`: `role="checkbox"` with `aria-checked="mixed"` for the indeterminate state, a hidden form input, Space to toggle, and the shared Button/Input focus ring).

First of the form-control family (Checkbox → Switch → Radio). Label-less by design (Escuela 1) — pair with a `<label htmlFor>`; error via `aria-invalid`. Indeterminate is a boolean `indeterminate` prop (Base UI's shape, not shadcn's `checked="indeterminate"` union). Check/dash marks are inline SVG — no icon dependency added to the bundle.

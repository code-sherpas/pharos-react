---
'@code-sherpas/pharos-react': minor
---

Add `Switch`, a single on/off toggle (the shadcn Switch contract) over Base
UI's `Switch` — `role="switch"`, Space to toggle, and the shared Button / Input
/ Checkbox focus ring. Sibling to `Checkbox` in the boolean form-control
family: same `checked` / `onCheckedChange` / `disabled` API, no third
`indeterminate` state (a toggle is binary). Label-less by design (D11): pair
with a `<label htmlFor>`; error via `aria-invalid`. Geometry is fully
token-derived (40×24 track, 16px thumb, spacing-4 travel); no icon dependency.

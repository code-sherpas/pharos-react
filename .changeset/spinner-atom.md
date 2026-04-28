---
'@code-sherpas/pharos-react': minor
---

Add `Spinner` atom — visual loading indicator with `role="status"` for assistive tech, three sizes (`sm` / `md` / `lg`) aligned with the form-control grid (16 / 20 / 24 px), and `currentColor` inheritance so it picks up the parent's text colour automatically (composition cases like `<Button intent="primary"><Spinner /></Button>` work out of the box, no `Button isLoading` prop required at the atom level).

Inline SVG with CSS `@keyframes` rotation — zero icon-library dependencies (no `lucide-react`, no `framer-motion`). Honours `prefers-reduced-motion` by slowing the rotation to 4 s instead of removing it (assistive UX still benefits from the in-progress cue).

`srLabel` prop (default `"Loading…"`) is rendered as visually-hidden text inside the status node; pass an action-specific label (`"Saving template…"`, `"Deleting…"`) when relevant. No `tone` axis on the atom; consumers set the colour by setting `color` on the parent or via `className` — same pattern Radix Themes / shadcn / Mantine use.

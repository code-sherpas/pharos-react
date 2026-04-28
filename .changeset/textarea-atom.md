---
'@code-sherpas/pharos-react': minor
---

Add `Textarea` atom — multi-line text input that mirrors the form-control chrome of `Input` (border tone `neutral-500` for WCAG 1.4.11 compliance, identical focus ring, identical inline padding per size). No `variant` axis (composition Escuela 1, decision D11): error state via `aria-invalid="true"`, message text rendered by the consumer or by the future `<Field>` molecule.

Three `size` values (`sm` / `md` / `lg`) align inline padding and font-size with `Input` so a textarea sits flush next to inputs in the same form. Vertical dimension uses `min-height` (~3-4 lines at the size's font-size) plus `resize: vertical` so users can drag the bottom edge to grow it; consumers can override via `style.resize` if needed.

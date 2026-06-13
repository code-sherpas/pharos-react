---
'@code-sherpas/pharos-react': minor
---

Add the `Select` and `Combobox` atoms — the selection family (Decision D17).

Two atoms split by interaction contract, matching the shadcn / Base UI / ARIA
APG consensus:

- **`Select`** — pick from a known set of options (the ARIA listbox pattern,
  no text input). Wraps Base UI's `Select.*`. Parts: `Select`, `SelectTrigger`,
  `SelectValue`, `SelectContent`, `SelectItem`, `SelectGroup`, `SelectLabel`,
  `SelectSeparator`.
- **`Combobox`** — a text input that filters a known set (the APG combobox
  pattern). Wraps Base UI's `Combobox.*`. Parts: `Combobox`, `ComboboxControl`,
  `ComboboxChips`, `ComboboxInput`, `ComboboxTrigger`, `ComboboxClear`,
  `ComboboxChip`, `ComboboxChipRemove`, `ComboboxContent`, `ComboboxList`,
  `ComboboxItem`, `ComboboxEmpty`, `ComboboxGroup`, `ComboboxGroupLabel`,
  `ComboboxSeparator`.

Multi-select is the `multiple` axis on each root (not a separate atom);
single-select closes on pick, multi-select keeps the popup open. Both popups
take `min-width: var(--anchor-width)` so they are never narrower than their
control. The trigger/control share the Input chrome (WCAG 1.4.11 border tone,
brand focus ring, `sm`/`md`/`lg` size grid). Following Escuela 1 (D11) neither
atom owns label/helper/error — compose those and convey error via
`aria-invalid`.

---
'@code-sherpas/pharos-react': minor
---

Add `RadioGroup` + `RadioGroupItem`, a set of mutually exclusive options (the
shadcn RadioGroup contract) over Base UI's `RadioGroup` + `Radio` —
`role="radiogroup"` / `role="radio"`, arrow-key navigation, single selection,
and the shared Button / Input / Checkbox / Switch focus ring. Completes the
boolean/choice form-control family (Checkbox → Switch → Radio). Compound
(group + item) because the selection semantics live on the group. Label-less by
design (D11): pair the group with a `<label>` / `aria-labelledby` and each item
with a `<label htmlFor>`; error via `aria-invalid` on the group. The selected
dot is a CSS `<span>` — no icon dependency.

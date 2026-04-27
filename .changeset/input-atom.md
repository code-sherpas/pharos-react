---
'@code-sherpas/pharos-react': minor
---

Add `Input` atom — the first form-control primitive in Pharos.

Single chrome (no `variant` axis) with three sizes (`sm | md | lg`) whose
heights match the Button grid. Native HTML `<input>` props pass through
unchanged. Error state is conveyed through the standard
`aria-invalid="true"` attribute, not a custom `error` prop — the CSS
reacts to the attribute, matching shadcn / Base UI / Mantine. Helper /
message text and the surrounding label are the consumer's responsibility
(Escuela 1 composition); a `<Field>` molecule that encapsulates the full
label + control + message contract is planned for a later release.

Public API:

```tsx
<Input size="sm | md | lg" />
<Input aria-invalid="true" />
<Input disabled />
<Input readOnly />
```

The Alexandria → Pharos mapping is documented in `NAMING-decisions.md`.
At adoption time, Alexandria's local `Input.tsx` becomes a thin
Field-style wrapper that renders `<PharosInput aria-invalid={...} />`
plus the existing `<FormFieldMessage>` — the same incremental pattern
used for `Pill → Badge`, so the 11 call-sites under
`@/web-application-src/common/components/form/Input` keep their current
prop surface.

This release also normalises the resting border of every outlined
primitive to `--pharos-color-neutral-500`, which clears WCAG 1.4.11
(Non-text Contrast, 3:1 against the surface). Three components carry
the deliberate visual shift:

- `Input` — lands at `neutral-500` from day one.
- `Button intent="secondary"` — was `neutral-200`, now `neutral-500`;
  hover no longer shifts the border tone (background change is
  enough to express the state).
- `Badge variant="outline"` — was `neutral-300`, now `neutral-500`.

The cross-DS rationale, the contrast math, and the visual trade-off
live in `NAMING-decisions.md` under "Cross-cutting: control border
intensity (WCAG 1.4.11)".

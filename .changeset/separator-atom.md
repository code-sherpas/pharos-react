---
'@code-sherpas/pharos-react': minor
---

Add `Separator` atom — visual or semantic divider between two regions.

Public API:

```tsx
<Separator orientation="horizontal | vertical" decorative={true | false} />
```

Defaults: `orientation="horizontal"`, `decorative={true}`. Native
`<div>` props pass through unchanged.

The atom is the first realisation of **Decision D12** (subtle borders
for non-interactive surfaces). Resting tone is
`--pharos-color-neutral-200`, the same intensity Carbon `border-subtle`,
Adobe Spectrum gray-200 and Polaris use for dividers. WCAG 1.4.11 does
not apply (a separator is not a UI component or a state indicator), so
the strong `neutral-500` reserved for interactive controls (Input,
Button secondary, Badge outline — D10) deliberately stays out of this
primitive.

When `decorative={true}` (default) the element is `role="none"` and
ignored by assistive tech. When `decorative={false}` it becomes
`role="separator"` and, for vertical separators, exposes
`aria-orientation="vertical"` (per the ARIA APG spec, the attribute is
omitted on horizontal separators because that is the role's default).

The cross-DS rationale, the contrast math and the three-level border
hierarchy that lands with this release live in `NAMING-decisions.md`
under "Cross-cutting: border intensity hierarchy".

Adoption note: the upcoming Alexandria PR audits the ~80 ad-hoc divider
call-sites (`<hr>` + `border-t`/`border-b` + `<div className="h-px ..." />`)
and swaps the standalone divider patterns to `<Separator>`. Tailwind
borders that are actually a side of a Card surface stay on the
container until `Card` ships next.

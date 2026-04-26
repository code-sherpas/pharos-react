---
'@code-sherpas/pharos-react': minor
---

Add `Badge` component (second atom of Phase 2). State-of-the-art
shadcn-style API: a single `variant` axis with seven values
(`default`, `secondary`, `destructive`, `outline`, `success`,
`warning`, `info`). One shape (rounded-md rectangle), no built-in
`onRemove` — chip-removable UX is composed externally with a sibling
button.

Public exports:

- `Badge` — the component.
- `badgeVariants` — CVA helper for consumers that need to style a
  custom element with the same variant classes.
- `BadgeProps` — type for the props.

Tokens consumed: `--pharos-color-neutral-{100,300,900}`,
`--pharos-color-base-white`,
`--pharos-color-semantic-{success,warning,error,info}-{fg,on}`,
`--pharos-radius-md`, `--pharos-spacing-{1,2,5}`,
`--pharos-font-family-sans`, `--pharos-font-size-xs`,
`--pharos-font-weight-medium`.

Naming and migration mapping from Alexandria's `Pill` / `Chip` /
`StatusBadge` is documented in `NAMING-decisions.md` per the
state-of-the-art rule (PLAN §7, AGENTS.md): Alexandria adapts to
Pharos at adoption time, not the reverse.

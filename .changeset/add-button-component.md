---
'@code-sherpas/pharos-react': minor
---

add Button component

First Pharos component, following shadcn/ui canonical naming. Ships with:

- Variants via CVA: `intent` (`primary` / `secondary` / `ghost` / `destructive`)
  and `size` (`sm` / `md` / `lg`).
- Native `<button>` with `type="button"` default, full keyboard activation, and
  `focus-visible` rings tied to Pharos tokens.
- Colors, radii and borders resolved from `--pharos-*` via the `@theme inline`
  mapping — no hardcoded hex or rem values.

See `NAMING-decisions.md` for the Alexandria → Pharos mapping.

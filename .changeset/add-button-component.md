---
'@code-sherpas/pharos-react': minor
---

add Button component, adopt Base UI render prop, complete token theme mapping

First Pharos component, following shadcn/ui canonical naming:

- Variants via CVA: `intent` (`primary` / `secondary` / `ghost` /
  `destructive`) and `size` (`sm` / `md` / `lg`).
- Native `<button>` with `type="button"` default, full keyboard
  activation, and `focus-visible` rings tied to Pharos tokens.
- Composition via Base UI's `render` prop (element or function) so
  consumers can render the Button as a router `<Link>`, an anchor, or
  any wrapper without losing styling or behavior. Powered by
  `useRender` from `@base-ui-components/react` (added as peer
  dependency).

Alongside the component, the `@theme inline` block in
`src/styles/index.css` now maps **every** Pharos token category onto
Tailwind v4's theme namespaces — colors, radius, spacing, typography
(families, sizes, weights, line heights, letter spacing), shadows,
motion (duration + easing) and z-index. Every utility class that
pharos-react or its consumers rely on (`p-4`, `text-sm`, `shadow-md`,
`ease-out`, `z-modal`, ...) resolves to a `--pharos-*` CSS var, which
means a runtime override at the `--pharos-*` layer propagates to the
whole UI.

See `NAMING-decisions.md` for the Alexandria → Pharos mapping.

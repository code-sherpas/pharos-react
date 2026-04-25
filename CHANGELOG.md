# @code-sherpas/pharos-react

## 0.2.2

### Patch Changes

- 719ac6e: Fix `dist/index.d.ts` shipping as an empty `export {}` — every previously published release (0.1.0, 0.2.0, 0.2.1) failed to expose `Button`, `ButtonProps`, `PharosHello`, `cn` to TypeScript consumers. Root cause: `vite-plugin-dts` with `rollupTypes: true` uses API Extractor, which silently fails when TypeScript is newer than its bundled compiler engine and produces an empty barrel. Disabled `rollupTypes` and added a dedicated `tsconfig.build.json` (`rootDir: src`) so per-file declarations are emitted directly under `dist/` and the public exports resolve correctly. No runtime change.

  Also wires a `verify:dist-types` smoke check directly into `pnpm build`: a tiny consumer file under `tests/dist-types-smoke.ts` imports every public symbol from the built `dist/` and is type-checked with a dedicated `tsconfig.dist-smoke.json`. Any future regression that ships an empty / incomplete barrel — for any reason — fails the build step (and therefore CI, `prepublishOnly`, and local builds) before a release can be cut.

## 0.2.1

### Patch Changes

- 893e2eb: Bump `@code-sherpas/pharos-tokens` peer range from `^0.3.0` to `^0.4.0`. Picks up Decision D8 (default sans-serif is now Outfit-first + Inter fallback) and the relaxed `engines.node>=22` of the tokens package. No source change in this package.

## 0.2.0

### Minor Changes

- b8adc16: add Button component, adopt Base UI render prop, complete token theme mapping

  First Pharos component, following shadcn/ui canonical naming:
  - Variants via CVA: `intent` (`primary` / `secondary` / `ghost` /
    `destructive`) and `size` (`sm` / `md` / `lg`).
  - Native `<button>` with `type="button"` default, full keyboard
    activation, and `focus-visible` rings tied to Pharos tokens.
  - Composition via Base UI's `render` prop (element or function) so
    consumers can render the Button as a router `<Link>`, an anchor, or
    any wrapper without losing styling or behavior. Powered by
    `useRender` from `@base-ui/react` (added as peer dependency).

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

## 0.1.0

### Minor Changes

- d03c498: Initial release — scaffolded React component library consuming
  `@code-sherpas/pharos-tokens` via `@theme inline`.

  Ships a single demo component (`PharosHello`), the `cn` helper on top of
  `clsx` + `tailwind-merge`, and the compiled stylesheet at
  `@code-sherpas/pharos-react/styles.css`. Intended as a baseline so
  downstream consumers (`alexandria-design`, `alexandria-web-application`)
  can start integrating the import path and peer-dependency chain before
  real components land in Phase 2.

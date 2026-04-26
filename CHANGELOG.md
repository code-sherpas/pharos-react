# @code-sherpas/pharos-react

## 0.3.0

### Minor Changes

- 296f8d3: Migrate the published bundle from Tailwind v4 + CVA-with-utility-strings to **CSS Modules** (Decision D9). The bundle now contains zero `@layer` rules, zero preflight, zero global resets, and no Tailwind classes — just hashed CSS Modules class names that the React components reference. Consumers can use `pharos-react` regardless of whether their app uses Tailwind v3, v4, or no CSS framework at all.

  **Why this is a real change for consumers, not just an internal refactor**

  Earlier releases (`0.1.0`–`0.2.2`) shipped Tailwind v4 compiled output with `@layer base`, `@layer utilities`, and a global preflight in `dist/styles.css`. Tailwind v3's PostCSS plugin (used by Next.js + Tailwind v3 apps) reinterpreted that output as Tailwind source and failed with `@layer base is used but no matching @tailwind base directive`. Even consumers without Tailwind v3 received an unwanted CSS reset.

  The new bundle is a flat list of hashed-class rules and CSS variables sourced from `--pharos-*` tokens. No PostCSS plugin can misinterpret it. It works the same in every React stack.

  **Public API surface**
  - Components and props are unchanged. `Button` accepts the same `intent` / `size` axes, the same `render` prop, the same children.
  - Each component now sets `data-pharos-intent` and `data-pharos-size` attributes on its rendered element. Tests, e2e suites, and consumer CSS can use these as stable hooks (the underlying class names are hashed and not part of the API).
  - `cn` is now a `clsx` shim — `tailwind-merge` is no longer a dependency. Consumers that need Tailwind class-conflict resolution should use their own `tailwind-merge` helper. Pharos's class names are CSS Modules hashes that no resolver would touch anyway.
  - `tailwindcss`, `@tailwindcss/vite`, `tailwind-merge` removed from this package's dependency tree.

  **Consumer migration**

  For most consumers, no code change is required — the package's exports are byte-compatible at the `.tsx` level. If you were relying on:
  - A specific Tailwind utility class on a Pharos component (e.g. asserting in a test that `<Button>` has `bg-neutral-900`), switch to the `data-pharos-intent="primary"` / `data-pharos-size="md"` attributes.
  - The Tailwind preflight that used to ship inside `pharos-react/styles.css`, you must now provide your own (typical apps already do).
  - The exported `cn` helper for `tailwind-merge` semantics, install `tailwind-merge` directly.

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

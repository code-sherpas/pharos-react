---
'@code-sherpas/pharos-react': minor
---

Migrate the published bundle from Tailwind v4 + CVA-with-utility-strings to **CSS Modules** (Decision D9). The bundle now contains zero `@layer` rules, zero preflight, zero global resets, and no Tailwind classes — just hashed CSS Modules class names that the React components reference. Consumers can use `pharos-react` regardless of whether their app uses Tailwind v3, v4, or no CSS framework at all.

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

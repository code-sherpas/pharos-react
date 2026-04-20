# pharos-react

React component library for Code Sherpas, published as `@code-sherpas/pharos-react`.
Consumes `@code-sherpas/pharos-tokens` as a peer dependency. Built with Vite
library mode + React 19 + Tailwind v4 + TypeScript.

## Stack

- Single-package repo (pnpm)
- React 19 + TypeScript
- Vite 7 library mode (ESM output, types emitted via `vite-plugin-dts`)
- Tailwind v4 via `@tailwindcss/vite`
- `class-variance-authority` + `clsx` + `tailwind-merge` for variants
- Vitest (jsdom) + Testing Library
- Storybook 10 + Chromatic (added in phase 1B.4 / 1B.5)
- Changesets

## Philosophy

pharos-react is the component layer that consumes `pharos-tokens`. It does not
redefine tokens — every visual value (color, spacing, radius, typography) is a
CSS var from `@code-sherpas/pharos-tokens`.

Principles:

1. **Tokens come from `pharos-tokens`.** `pharos-react` never hardcodes hex,
   rem/px spacing, or shadow values. Tokens are mapped to Tailwind theme vars
   via `@theme inline` in `src/styles/index.css`.
2. **Canonical naming.** Components follow shadcn/ui > Base UI > ARIA APG, in
   that order. Tiebreaker: shorter, more generic name wins. `Button`, not
   `PrimaryButton`. `Dialog`, not `Modal`. `Sheet`, not `Drawer`.
3. **Variants, not sub-components.** Use CVA for `variant`/`size`/`tone`.
4. **Accessible by default.** Primitives (Base UI) carry ARIA; we wrap them
   without regressing semantics.
5. **Changeset required.** Every PR that touches the public API includes a
   changeset. See semver policy in `.changeset/README.md`.

## NON-NEGOTIABLE rules

1. **No hardcoded design values.** Colors, spacing, radius, shadow, typography,
   z-index and motion come from `--pharos-*` or the mapped Tailwind theme vars.
2. **No direct imports of primitive libraries.** Do not re-export
   `@radix-ui/*` or `@base-ui-components/*` directly. Wrap them.
3. **Canonical names only.** When adding a component, check shadcn first. If
   the Alexandria name differs, Pharos still uses the canonical one.
4. **Lucide for icons.** Decision D4. Custom icons only if Lucide does not
   cover the need; live under `src/icons/`.
5. **Body typography is 14 / 20.** Decision D3. Do not reintroduce `text-base`
   as the default.
6. **One red.** Decision D2. Use `semantic.error`; do not add `laser-red` or
   `true-red` aliases.
7. **No Tailwind classes with inline hex.** `bg-[#abcdef]` is forbidden;
   use mapped theme vars or `bg-[var(--pharos-*)]` for escape hatches.

## Build outputs

`pnpm build` (Vite library mode) generates:

- `dist/index.js` — ESM barrel.
- `dist/index.d.ts` — rolled-up types (`vite-plugin-dts` with `rollupTypes`).
- `dist/styles.css` — compiled Tailwind v4 output including the Pharos theme
  mapping. Consumers import it once at their entry point.
- `dist/*.map` — source maps.

Externals: `react`, `react-dom`, `react/jsx-runtime`,
`@code-sherpas/pharos-tokens` (and subpaths).

## Consuming the package

```ts
import '@code-sherpas/pharos-react/styles.css'; // side-effect, once per app
import { PharosHello } from '@code-sherpas/pharos-react';
```

`pharos-tokens` is a **peer dependency**. Consumers must install it explicitly:

```bash
pnpm add @code-sherpas/pharos-react @code-sherpas/pharos-tokens
```

## Expected MCP servers

This repo has `.mcp.json` with: `context7`, `github`, `shadcn`.

**When to use each one:**

- **`context7`** → live docs for React 19, Vite 7 library mode, Tailwind v4
  (`@theme inline`, `@tailwindcss/vite`), CVA, tailwind-merge, Storybook 10,
  Chromatic, Vitest. Use it before tweaking `vite.config.ts`, writing new
  Tailwind config, or upgrading any of the above.
- **`github`** → issues, PRs, releases; reference consumer issues (e.g.
  "alexandria-web-application needs Sheet").
- **`shadcn`** → canonical component references. Use it when designing a new
  component to confirm the expected API, accessibility contract, and variant
  axes before implementing.

## Useful commands

- `pnpm build` — compile the library to `dist/`.
- `pnpm test` — Vitest (jsdom) suite.
- `pnpm typecheck` — `tsc --noEmit`.
- `pnpm lint` — ESLint.
- `pnpm format` / `pnpm format:check` — Prettier.
- `pnpm changeset` — create a changeset.
- `pnpm release` — (CI only) build + publish to npm.

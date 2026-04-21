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

1. **DS and library quality above current-Alexandria visual fidelity.**
   Pharos is the explicit extraction of Alexandria's implicit design system,
   but Pharos is not Alexandria's mirror. When a best-practice DS choice
   (token structure, component naming, variant axes, accessibility contract,
   size grid) conflicts with a current Alexandria quirk, the DS choice wins.
   Tokens stay as close to Alexandria values as possible without compromising
   this.
2. **Tokens come from `pharos-tokens`.** `pharos-react` never hardcodes hex,
   rem/px spacing, or shadow values. Tokens are mapped to Tailwind theme vars
   via `@theme inline` in `src/styles/index.css`.
3. **Canonical naming.** Components follow shadcn/ui > Base UI > ARIA APG, in
   that order. Tiebreaker: shorter, more generic name wins. `Button`, not
   `PrimaryButton`. `Dialog`, not `Modal`. `Sheet`, not `Drawer`.
4. **Variants, not sub-components.** Use CVA for `variant`/`size`/`tone`.
5. **Accessible by default.** Primitives (Base UI) carry ARIA; we wrap them
   without regressing semantics.
6. **Changeset required.** Every PR that touches the public API includes a
   changeset. See semver policy in `.changeset/README.md`.
7. **Atomic-design build order.** Ship atoms first, then molecules, then
   organisms. Rationale: molecules and organisms compose the atoms, so
   shipping the bottom of the tree first means later components reuse
   already-stable primitives instead of temporary stubs.

## Relationship with Alexandria

`alexandria-web-application` is the first consumer of Pharos. The migration
is **incremental**, not a big-bang end-of-plan event:

1. A component lands in `pharos-react` on a feature branch, with stories,
   tests, Chromatic baseline, and a changeset.
2. When the PR merges and Changesets publishes the new version to npm, a
   separate PR opens in `alexandria-web-application` that:
   - Replaces every instance of the Alexandria equivalent(s) with the
     Pharos component, following the mapping in `NAMING-decisions.md`.
   - Deletes the obsolete Alexandria components once all call-sites are
     swapped.
   - Lists **every affected route** (URL paths under `/app/`) in the PR
     description as a QA checklist.
   - Appends a summary entry to `docs/migration-log.md` in
     `alexandria-web-application` for historical traceability.
3. This only applies when the swap is a local textual replacement
   (prop remap + import change). Cases that require structural refactor
   (JSX-tree changes, state ownership moves, file relocation) are
   deferred to Fase 6 of the master plan. See
   `PLAN-pharos-alexandria.md` for the catalog of what is incremental
   vs deferred.

Pharos is the source of truth for the design system. Alexandria consumes it.
When a Pharos release introduces a deliberate visual change from Alexandria
(e.g. `NewButton`'s navy fill becoming brand blue), that is the DS deciding
what the design vocabulary means — not a bug. Deliberate changes are
documented in the component's entry in `NAMING-decisions.md` at the time
the swap PR opens.

## NON-NEGOTIABLE rules

1. **No hardcoded design values.** Colors, spacing, radius, shadow, typography,
   z-index and motion come from `--pharos-*` or the mapped Tailwind theme vars.
2. **No direct imports of primitive libraries.** Do not re-export
   `@radix-ui/*` or `@base-ui/*` directly. Wrap them.
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

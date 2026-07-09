# pharos-react

React component library for Code Sherpas, published as `@code-sherpas/pharos-react`.
Consumes `@code-sherpas/pharos-tokens` as a peer dependency. Built with Vite
library mode + React 19 + **CSS Modules** + TypeScript. The published bundle
contains **no Tailwind, no PostCSS preflight, no global resets** — see
Decision D9 in `PLAN-pharos-alexandria.md`.

## Stack

- pnpm workspace: the published library (repo root) + a private, never-published
  consumer-harness app under `examples/` (see _Consumer harness_)
- React 19 + TypeScript
- Vite library mode (ESM output, types emitted via `vite-plugin-dts`)
- **CSS Modules** for component styles (one `<Component>.module.css` per
  component, hashed class names in `dist/styles.css`)
- `class-variance-authority` + `clsx` for variant composition
- Vitest (jsdom) + Testing Library
- Storybook 10 + Chromatic (added in phase 1B.4 / 1B.5)
- Playwright e2e over a SaaS-style consumer harness — integration/composition
  regression net (`examples/saas-demo`)
- Changesets

## Philosophy

pharos-react is the component layer that consumes `pharos-tokens`. It does not
redefine tokens — every visual value (color, spacing, radius, typography) is a
CSS var from `@code-sherpas/pharos-tokens`, referenced via `var(--pharos-*)`
inside each `*.module.css`.

Principles:

1. **State-of-the-art first; Alexandria adapts to Pharos, not the
   reverse.** (Cardinal rule, restated by the CTO on 2026-04-26.)
   Pharos is the explicit extraction of Alexandria's implicit design
   system, but Pharos is not Alexandria's mirror — it is the
   state-of-the-art version Alexandria will adopt. When a DS / library
   best practice (token structure, canonical naming, variant axes,
   accessibility contract, composition pattern, size grid) conflicts
   with Alexandria's current API or quirk, **the DS choice always
   wins**. Alexandria refactors at adoption time; structural cases
   roll into Phase 6. Token numerical values stay as close to
   Alexandria as possible without compromising this; component APIs
   follow shadcn / Base UI / ARIA APG without shortcuts.
2. **Tokens come from `pharos-tokens`.** `pharos-react` never hardcodes hex,
   rem/px spacing, or shadow values. Tokens are referenced directly inside
   `<Component>.module.css` via `var(--pharos-color-*)`, `var(--pharos-spacing-*)`,
   etc. There is no Tailwind theme mapping in this repo (D9).
3. **Canonical naming.** Components follow shadcn/ui > Base UI > ARIA APG,
   in that order — but only for the **API contract** (variant axes, prop
   shapes, accessibility). Implementation does not copy shadcn's Tailwind
   utility strings; we reauthor styles as CSS Modules.
4. **Variants, not sub-components.** Use CVA for `variant`/`size`/`tone`.
   Each variant key in `cva({ variants })` maps to a class on the imported
   `styles` object (e.g. `intent: { primary: styles.primary }`).
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
   z-index and motion come from `--pharos-*` referenced inside CSS Modules.
2. **No direct imports of primitive libraries.** Do not re-export
   `@radix-ui/*` or `@base-ui/*` directly. Wrap them.
3. **Canonical names only.** When adding a component, check shadcn first. If
   the Alexandria name differs, Pharos still uses the canonical one.
4. **Lucide for icons.** Decision D4. Custom icons only if Lucide does not
   cover the need; live under `src/icons/`.
5. **Body typography is 14 / 20.** Decision D3. Do not reintroduce a 16-px
   default body size.
6. **One red.** Decision D2. Use `semantic.error`; do not add `laser-red` or
   `true-red` aliases.
7. **No Tailwind in src/.** Decision D9. The published bundle must not
   contain Tailwind utility classes (`.h-10`, `.bg-neutral-900`, etc.) nor
   `@layer` rules nor preflight. Author each component as
   `<Component>.module.css` next to the `.tsx`. Storybook may load its own
   demo CSS (under `.storybook/`), but that never enters the published
   bundle.
8. **Every component ships into the consumer harness.** Adding or changing a
   public component is not "done" until it is used in `examples/saas-demo` and
   its real user flow is covered by a Playwright test under
   `examples/saas-demo/e2e/`. The harness consumes the built package
   (`workspace:*` → `dist/`, `styles.css`, `pharos-tokens/css`) exactly like an
   external consumer, so it is the regression net for **composition** and the
   **publish contract** — the layer that unit tests, Storybook and Chromatic
   structurally cannot see. A PR that lands or changes a component without
   wiring it into the demo **and** a flow is incomplete. See _Consumer harness_.

## Build outputs

`pnpm build` (Vite library mode + `pnpm verify:dist-types`) generates:

- `dist/index.js` — ESM barrel.
- `dist/index.d.ts` — per-file types rolled to a single barrel via
  `tsconfig.build.json`.
- `dist/styles.css` — bundled CSS Modules of every component (hashed class
  names like `Button_button__a3f2`). Consumers import it once at their
  entry point.
- `dist/*.map` — source maps.

`prepublishOnly` runs the same script so a release cannot ship without the
type smoke check (`tests/dist-types-smoke.ts`) passing. See `fix/dts-rollup-empty`
PR for the rationale.

Externals: `react`, `react-dom`, `react/jsx-runtime`,
`@code-sherpas/pharos-tokens` (and subpaths), `@base-ui/react`.

## Consuming the package

```ts
import '@code-sherpas/pharos-tokens/css'; // CSS vars (peer dep, separately installed)
import '@code-sherpas/pharos-react/styles.css'; // component styles (one-off side effect)
import { Button } from '@code-sherpas/pharos-react';
```

The consumer needs **only CSS** — no Tailwind, no PostCSS, no preset, no
build-time framework dependency. Whether the consumer uses Tailwind v3 / v4
/ Bootstrap / nothing is unrelated to using pharos-react.

`pharos-tokens` is a **peer dependency**. Consumers must install it explicitly:

```bash
pnpm add @code-sherpas/pharos-react @code-sherpas/pharos-tokens
```

## Consumer harness (`examples/saas-demo`)

The repo is a pnpm workspace: the published library at the root plus a private,
never-published SaaS-style client under `examples/saas-demo`. Its whole reason
to exist is to consume Pharos **exactly like an external consumer** and prove,
end-to-end, that composing the components still works.

- It depends on `@code-sherpas/pharos-react` via `workspace:*`, which resolves
  through the package `exports` to the built `dist/` — not `src/`. So it runs
  against the real published artifact; `pnpm build` must run first.
- It imports the three consumer lines verbatim (`pharos-tokens/css`,
  `pharos-react/styles.css`, then components) and installs the same peer deps a
  real consumer must (`react`, `react-dom`, `@base-ui/react`, `pharos-tokens`).
- Playwright drives real user flows across composed components, asserting on
  ARIA roles and the stable `data-pharos-*` attributes — never hashed classes.

This catches what the other layers cannot: a broken `exports` map or a
component missing from `dist/styles.css`, overlay stacking / z-index when
overlays compose, focus-trap and focus-return across a real page, keyboard
flows spanning components, and token regressions from `pharos-tokens`.

Run it: `pnpm build` (once, to produce `dist/`) then `pnpm test:e2e` — or
`pnpm dev:demo` for the live app. CI runs it as the `consumer-e2e` job:
PR-gating, but deliberately **not** part of `pnpm test` nor `release.yml`
(browser-e2e flakiness must never gate an npm publish — same rule as the a11y
story runner). **Rule #8: every component must be wired into this harness with
a flow.**

## Authoring a component

Skeleton (with both files side by side under `src/components/`):

```css
/* Button.module.css */
.button { display: inline-flex; ... }
.primary { background: var(--pharos-color-neutral-900); ... }
.primary:hover { background: var(--pharos-color-neutral-700); }
.sizeMd { height: var(--pharos-spacing-10); ... }
```

```tsx
// Button.tsx
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/cn';
import styles from './Button.module.css';

const buttonVariants = cva(styles.button, {
  variants: {
    intent: { primary: styles.primary, ... },
    size: { md: styles.sizeMd, ... },
  },
  defaultVariants: { intent: 'primary', size: 'md' },
});

export function Button({ intent, size, className, ...rest }: Props) {
  return (
    <button
      data-pharos-intent={intent ?? 'primary'}
      data-pharos-size={size ?? 'md'}
      className={cn(buttonVariants({ intent, size }), className)}
      {...rest}
    />
  );
}
```

`data-pharos-*` attributes mirror the resolved variant. Tests assert on them
(stable, no hash) and consumers can use them as CSS / e2e selectors without
having to know the hashed class names.

Shipping the component is not complete until it is wired into the consumer
harness: a real usage on a page in `examples/saas-demo` plus a Playwright flow
in its `e2e/`. This is part of the same PR, not a follow-up (rule #8, see
_Consumer harness_).

## Expected MCP servers

This repo has `.mcp.json` with: `context7`, `github`, `shadcn`.

**When to use each one:**

- **`context7`** → live docs for React 19, Vite library mode, CSS Modules,
  CVA, Storybook 10, Chromatic, Vitest. Use it before tweaking
  `vite.config.ts`, writing component CSS, or upgrading any of the above.
- **`github`** → issues, PRs, releases; reference consumer issues (e.g.
  "alexandria-web-application needs Sheet").
- **`shadcn`** → canonical component references. Use it to confirm the
  expected **API contract** (props, variants, accessibility) of a new
  component. Implementation in this repo always re-authors styles as CSS
  Modules — do not copy shadcn's Tailwind utility strings.

## Useful commands

- `pnpm build` — compile the library to `dist/` and run `verify:dist-types`.
- `pnpm test` — Vitest (jsdom) unit suite.
- `pnpm test:storybook` — story a11y (axe) in a real Chromium (needs Playwright).
- `pnpm test:e2e` — Playwright e2e over the consumer harness (run `pnpm build` first).
- `pnpm dev:demo` — run the `examples/saas-demo` app locally (Vite dev).
- `pnpm typecheck` — `tsc --noEmit`.
- `pnpm verify:dist-types` — smoke-check the published `.d.ts` exposes
  every public symbol (regression guard for `dist/index.d.ts`).
- `pnpm lint` — ESLint.
- `pnpm format` / `pnpm format:check` — Prettier.
- `pnpm changeset` — create a changeset.
- `pnpm release` — (CI only) build + publish to npm.

## Project knowledge & where things go

This repo is part of the **Pharos design-system program** (`pharos-tokens` →
`pharos-react` → `alexandria-design` → `alexandria-web-application`).
Program-level knowledge lives in **Notion → "Programa Pharos"**; code-coupled
knowledge lives in the repos.

**Rule #0 — cardinal, non-negotiable (overrides every other rule here and in
Notion).** Pharos follows the **state-of-the-art of the best design systems** —
clarity, accessibility, canonical naming, API contracts, variant axes,
composition — **above any Alexandria-specific consideration** (visual fidelity,
quirks, convenience). Pharos is the state-of-the-art version Alexandria adopts,
not its mirror. When a DS best practice conflicts with something in Alexandria,
the DS wins; Alexandria adapts at adoption time. If something doesn't fit an
atom, don't force it — it's a different atom; defer it. Deliberate visual
changes are documented. (This restates Principle #1 above and is the program's
top rule.)

**Notion — "Programa Pharos" (team space):**

- Hub: https://app.notion.com/p/38c1751eee1081a3834ff68c3485c03c
- Roadmap: https://app.notion.com/p/38c1751eee10819189e2d0055549bc38
- Status: https://app.notion.com/p/38c1751eee1081589118edcdd40d5eee
- Decisions (D1–D17): https://app.notion.com/p/fea64661135b4c9aa186b4293f639dee
- Runbooks (CI/release/Chromatic, verification): https://app.notion.com/p/38c1751eee108126b580fc8b76f8205f
- Working agreements: https://app.notion.com/p/38c1751eee1081e29d03f4a97d2a9e96
- Tasks / follow-ups: https://app.notion.com/p/3ad5ddddeb384e449d8ca966e4700165
- Onboarding: https://app.notion.com/p/38c1751eee10814d989ddeaf01c45838

**Where each thing goes** — single source of truth: each fact has ONE home;
link from elsewhere, never copy.

| Content                                                         | Home                                                                      |
| --------------------------------------------------------------- | ------------------------------------------------------------------------- |
| Code, tests, changesets                                         | this repo                                                                 |
| Library/API contract, naming, component rules                   | the owning Pharos repo (`RULES.md`, `NAMING-decisions.md`)                |
| Per-repo tech debt & adoption log                               | the repo (`docs/` — e.g. `docs/migration-log.md`, `docs/technical-debt/`) |
| Agent skills (how we build)                                     | `code-sherpas/agent-skills` (skills-lock)                                 |
| Roadmap, plan, phase status                                     | Notion → Roadmap / Status                                                 |
| Architecture/program decisions (ADRs)                           | Notion → Decisions (link to the repo doc if repo-local)                   |
| Runbooks, CI/release/Chromatic quirks, verification recipes     | Notion → Runbooks                                                         |
| Team norms / working agreements                                 | Notion → Working agreements                                               |
| Task tracking / follow-ups                                      | Notion → Tasks                                                            |
| Personal / machine-local (`settings.local.json`, language pref) | stays local; never shared                                                 |

`CLAUDE.md` is a symlink to this file (`.claude/CLAUDE.md → ../AGENTS.md`), so
Claude Code loads these rules automatically.

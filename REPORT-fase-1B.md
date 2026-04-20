# Phase 1B Report: `@code-sherpas/pharos-react`

**Date:** 2026-04-20
**Actual duration:** ~1 day (multiple iterative sessions).
**Plan estimate:** 3-4 days.

## Executive summary

The `pharos-react` repo is scaffolded as a Vite library-mode React 19 package
that consumes `@code-sherpas/pharos-tokens` via `@theme inline`. A single
demo component (`PharosHello`) plus Storybook 10 with four top-level pages
(Welcome, Principles, Tokens gallery, Changelog) is live. Continuous
integration runs lint + typecheck + build + Vitest on every PR; Chromatic
runs visual regression on every push; Render hosts the public Storybook;
Changesets drives versioning and npm publishing via OIDC Trusted Publishing
with provenance. The first release, **`0.1.0`**, is published with
provenance directly — no classic automation-token bootstrap was ultimately
needed.

## URLs

- **npm package:** https://www.npmjs.com/package/@code-sherpas/pharos-react
  (version `0.1.0`, signed attestation via npm Trusted Publishing).
- **Storybook (Render, auto-deployed on push to `main`):**
  https://pharos-react-storybook.onrender.com
- **Chromatic (visual review):**
  https://www.chromatic.com/library?appId=69e5bc8ccffe0944defb379a
- **Repo:** https://github.com/code-sherpas/pharos-react (public, MIT).
- **Git tag:** `v0.1.0` on `main`.

## Deliverables

Everything under `/home/david/code-sherpas/pharos/pharos-react/`
(merged to `main`).

### Source

- `src/styles/index.css` — `@import @code-sherpas/pharos-tokens/css` +
  `@import tailwindcss` + `@theme inline` mapping every Pharos CSS var
  to Tailwind v4 theme vars (`--color-primary-600` etc.). Includes
  `@source not "../../**/*.md"` so Tailwind skips prose that contains
  `bg-[var(--pharos-*)]` as examples.
- `src/lib/cn.ts` — `clsx` + `tailwind-merge` wrapper.
- `src/components/PharosHello.tsx` — demo component, used to validate the
  token → Tailwind → React pipeline.
- `src/components/PharosHello.stories.tsx` — Storybook story with Default
  and WithName variants.
- `src/index.ts` — side-effect CSS import + barrel exports.

### Build outputs (`pnpm build`)

- `dist/index.js` — ESM bundle (~37 kB).
- `dist/index.d.ts` — rolled-up types via `vite-plugin-dts`.
- `dist/styles.css` — compiled Tailwind v4 + Pharos theme (~11 kB).
- `dist/*.map` — source maps.

### Storybook (Storybook 10 + `@storybook/react-vite`)

- `.storybook/main.ts` — stories glob for `stories/**` and
  `src/**/*.stories.tsx`, `@storybook/addon-docs` +
  `@storybook/addon-a11y`. `viteFinal` strips the library-mode-only
  config (`build.lib`, `rollupOptions`, the `vite:dts` plugin) so
  Storybook can serve a regular SPA.
- `.storybook/preview.ts` — imports `src/styles/index.css` globally and
  exposes Pharos surface backgrounds as Storybook backgrounds.
- `stories/Welcome.mdx` — entry overview of the two-package layout.
- `stories/Principles.mdx` — non-negotiable rules + D2/D3/D4/D5/D6.
- `stories/Tokens.stories.tsx` — dynamic gallery that reads
  `tokens.color.*`, `tokens.radius.*`, `tokens.spacing.*` directly from
  `@code-sherpas/pharos-tokens` so the page cannot drift from the source
  of truth.
- `stories/Changelog.mdx` — stub pointing at `CHANGELOG.md`.

### Tests (Vitest jsdom, Testing Library React 16)

- `tests/PharosHello.test.tsx` — 2 cases (default greeting, custom name).
- `tests/setup.ts` — `@testing-library/jest-dom` matchers.

### AI / tooling configuration

- `AGENTS.md` — source of truth; explains stack, non-negotiable rules,
  build outputs, consumption pattern, expected MCPs.
- `.claude/CLAUDE.md` — symlink → `../AGENTS.md`.
- `.mcp.json` — `context7` + `github` + `shadcn` (shadcn added for a
  React components repo).
- `RULES.md` — rules for consumers (shipped with the package).

### CI / release

- `.github/workflows/ci.yml` — pull request + push-to-main, runs install
  → build → typecheck → lint → format:check → test on Node 24.15.0 +
  pnpm 10.33.0.
- `.github/workflows/release.yml` — Changesets "Version packages" PR
  and publish via OIDC Trusted Publishing. GitHub App token
  (`RELEASE_APP_ID`, `RELEASE_APP_PRIVATE_KEY`) so the auto-opened PR
  retriggers CI; `id-token: write` for provenance attestations.
- `.github/workflows/chromatic.yml` — `chromaui/action@v11` with
  `exitOnceUploaded: true` + `onlyChanged: true` (TurboSnap).
- `.github/dependabot.yml` — daily for npm + github-actions.
- `.changeset/{config.json,README.md}` — Changesets config + semver
  policy for `pharos-react`.

### Package metadata

- `package.json`: `@code-sherpas/pharos-react@0.1.0`, `type: module`,
  `publishConfig: { access: public, provenance: true }`,
  `sideEffects: ["**/*.css"]`, `engines.node: ">=22"` (Alexandria runs
  Node 22 and is a downstream consumer), `packageManager: pnpm@10.33.0`.
- Peer deps: `react>=18`, `react-dom>=18`,
  `@code-sherpas/pharos-tokens^0.1.0`.
- Runtime deps: `class-variance-authority`, `clsx`, `tailwind-merge`.
- `pnpm.overrides.esbuild: ^0.25.0` for transitive CVEs.

## Decisions taken during 1B

### D-1B-1 — `engines.node` diverges from pharos-tokens

pharos-tokens pins `>=24` (publishing data + OIDC requirements),
pharos-react pins `>=22`. Alexandria runs on Node 22 and is the primary
consumer; forcing a Node upgrade in 1B would have delayed Phase 6
unnecessarily. The CI job still runs Node 24.15.0 locally and in GitHub
Actions, so we get the newer runtime where it matters.

### D-1B-2 — Tailwind v4 theme mapping via `@theme inline`

Mapping every `--pharos-*` CSS var to a Tailwind theme var
(`--color-primary-600` etc.) lets components write ergonomic classes
(`bg-primary-600`) that resolve to the Pharos source of truth. The
alternative — forcing `bg-[var(--pharos-color-primary-600)]` everywhere
— was discarded because it defeats the purpose of having a mapping
layer.

### D-1B-3 — Trusted Publishing configured pre-publish

npm now accepts Trusted Publisher configuration for packages that do
not yet exist (rollout late 2025). We relied on that: `0.1.0` shipped
with OIDC auth + provenance, no classic automation-token bootstrap. The
preemptive `NODE_AUTH_TOKEN` wiring in `release.yml` was never read and
is being removed in a follow-up PR.

### D-1B-4 — Chromatic action `onlyChanged: true`

TurboSnap saves snapshot quota on the free OSS tier by only
re-screenshotting stories whose dependency tree changed. This
tradeoff is acceptable at the current catalogue size; revisit if
false negatives appear when we have 20+ components.

### D-1B-5 — Single Storybook deploy, single Chromatic project

Render hosts the canonical Storybook for consumers (designers,
engineers). Chromatic is the review surface for UI PRs. They are not
redundant: Render is always-latest-main; Chromatic shows per-build
diffs with branch context. Render stays even after Chromatic because
Chromatic's free tier throttles public sharing; Render is free and
always-up.

## Known issues / follow-ups

1. **Clean up NPM_TOKEN**: PR `chore/drop-npm-token` removes the unused
   `NODE_AUTH_TOKEN` env var from `release.yml`. After merge, delete
   the `NPM_TOKEN` repo secret and revoke the token in npmjs.com.
2. **`vite-plugin-dts` v4.5.4 emits an outdated-API-Extractor warning**
   (bundled TS 5.9.3 vs our project TS 6.0.3). Cosmetic only; revisit
   when the plugin upgrades its API Extractor bundle.
3. **`@storybook/react-vite` runs the preview build through Node 20**
   inside `chromaui/action@v11`. No practical impact because the code
   path only does Vite-level work; flagged as a future simplification
   target if Chromatic's action ships a newer base image.
4. **Branch protection**: requires a first run of `chromatic.yml` on
   `main` before `UI Tests` appears as a selectable status check in
   GitHub. Set the rule after the `chore/drop-npm-token` merge pushes a
   new Chromatic build.
5. **CI does not yet run `build-storybook`**. Not blocking because
   Chromatic builds it on every push anyway; if Chromatic ever lags,
   add it to `ci.yml`.

## Checkpoint: what Phase 2 can assume

- `@code-sherpas/pharos-react@0.1.0` is installable from npm
  (`pnpm add @code-sherpas/pharos-react @code-sherpas/pharos-tokens`).
- Importing `@code-sherpas/pharos-react/styles.css` once at the
  consumer's entry point wires the Pharos theme everywhere.
- The Tailwind theme-var map exists; adding a new component is "write
  `<Name>.tsx`, write `<Name>.stories.tsx`, write a Vitest, add a
  changeset". CI enforces the rest.
- Changesets + Trusted Publishing are live: any merged `minor` /
  `patch` changeset publishes a new version with provenance the next
  time `main` receives a push.

Phase 2 starts with `Button` per the plan's component priority order.

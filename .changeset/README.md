# Changesets

This folder is managed by [changesets](https://github.com/changesets/changesets).

Every change to the public API of `@code-sherpas/pharos-react` — adding, modifying, or removing
components, variants, or props — must include a changeset.

## Quick reference

- `pnpm changeset` — record a new change (pick patch / minor / major).
- `pnpm changeset version` — consume all pending changesets, bump `package.json`, and write the changelog.
- `pnpm release` — build and publish to npm (CI only).

## Semver policy for pharos-react

| Change                                        | Bump             |
| --------------------------------------------- | ---------------- |
| Rename or remove a component / prop / variant | major (breaking) |
| Change peer dependency range (react, tokens)  | major (breaking) |
| Add a new component / prop / variant          | minor            |
| Visual refinement, a11y fix, bug fix, perf    | patch            |
| Internal build/tooling change                 | patch            |

Naming a component follows the canonical ordering: shadcn/ui > Base UI > ARIA APG. If an
Alexandria name diverges from the canonical one, Pharos still uses the canonical one; Alexandria
adapts when it consumes Pharos in phase 6.

# @code-sherpas/pharos-react

React component library for Code Sherpas. Consumes
[`@code-sherpas/pharos-tokens`](https://github.com/code-sherpas/pharos-tokens)
as a peer dependency. Built with Vite library mode, React 19, Tailwind v4.

## What's in this package

This package provides the **React component layer** of Code Sherpas's design
system. It does not define design values — those live in `pharos-tokens`.

## Installation

```bash
pnpm add @code-sherpas/pharos-react @code-sherpas/pharos-tokens
# or npm / yarn
```

`@code-sherpas/pharos-tokens` is a peer dependency and must be installed
explicitly alongside this package.

## Usage

```ts
// Root entry file (e.g. main.tsx, app/layout.tsx)
import '@code-sherpas/pharos-react/styles.css';
```

```tsx
import { PharosHello } from '@code-sherpas/pharos-react';

export function Demo() {
  return <PharosHello name="Alexandria" />;
}
```

## Rules for consumers

See [RULES.md](./RULES.md) — published with the package.

## Storybook

Live component reference (added in phase 1B.4): TBD.

## Contributing

1. `pnpm install`
2. Implement the component under `src/components/<Name>.tsx`, export it from
   `src/index.ts`.
3. Add tests under `tests/` (Vitest + Testing Library).
4. `pnpm build` — verify the Vite library bundle compiles cleanly.
5. `pnpm test` / `pnpm typecheck` / `pnpm lint`.
6. `pnpm changeset` — declare the type of change (patch / minor / major).
7. Open a PR.

## License

MIT. See [LICENSE](./LICENSE).

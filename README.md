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

The live component reference runs on Storybook 10 + `@storybook/react-vite`.

- `pnpm storybook` — dev server on port 6006.
- `pnpm build-storybook` — static build to `storybook-static/`. The hosted
  URL will be published once Render deployment is wired up (phase 1B.4 /
  1B.5).

## Contributing

1. `pnpm install`
2. Implement the component under `src/components/<Name>.tsx`, export it from
   `src/index.ts`.
3. Add a story alongside: `src/components/<Name>.stories.tsx`.
4. Add tests under `tests/` (Vitest + Testing Library).
5. `pnpm build` — verify the Vite library bundle compiles cleanly.
6. `pnpm build-storybook` — verify stories render.
7. `pnpm test` / `pnpm typecheck` / `pnpm lint` / `pnpm format:check`.
8. `pnpm changeset` — declare the type of change (patch / minor / major).
9. Open a PR.

## License

MIT. See [LICENSE](./LICENSE).

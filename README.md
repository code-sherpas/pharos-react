# @code-sherpas/pharos-react

React component library for Code Sherpas. Consumes
[`@code-sherpas/pharos-tokens`](https://github.com/code-sherpas/pharos-tokens)
as a peer dependency. Built with Vite library mode, React 19 and CSS Modules.
The published bundle ships zero Tailwind, zero PostCSS preflight and zero
global resets — see Decision D9 in [the master plan](https://app.notion.com/p/38c1751eee108174b5b0ea1633c773ed) (Notion).

Part of **Pharos**, Code Sherpas' design system: its visual direction and the
values of every token are decided in the
[Pharos design system artifact](https://claude.ai/artifact/AzsXQ2SHXhPJ9BhRSoGTbV),
the components here and the tokens in [`pharos-tokens`](https://github.com/code-sherpas/pharos-tokens), and the program's documentation (decisions, roadmap,
[quality standard](https://app.notion.com/p/3fa1751eee1081debcc6db3ac657e3ac))
lives in Notion → [Programa Pharos](https://app.notion.com/p/38c1751eee1081a3834ff68c3485c03c).

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
// Root entry file (e.g. main.tsx, app/layout.tsx). Import once.
import '@code-sherpas/pharos-tokens/css'; // CSS variables for the design tokens
import '@code-sherpas/pharos-react/styles.css'; // hashed component styles
```

```tsx
import { Button } from '@code-sherpas/pharos-react';

export function Demo() {
  return <Button intent="primary">Save changes</Button>;
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
2. Implement the component under `src/components/<Name>.tsx` plus its
   sibling `src/components/<Name>.module.css` (Decision D9). Export it from
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

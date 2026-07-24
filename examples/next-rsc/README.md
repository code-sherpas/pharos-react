# `@examples/next-rsc` — RSC consumer harness

A minimal **Next.js App Router** app that consumes the built Pharos artifact
(`dist/` + `styles.css` + `pharos-tokens/css`) via `workspace:*`, exactly like
an external consumer. Its job is to be the **regression net for the
per-component `"use client"` boundaries** introduced in #80 — a layer the Vite
`saas-demo` harness **structurally cannot see** (Vite has no server/client
boundary).

## What it proves

`next build` compiles and prerenders:

- **`app/page.tsx` (Server Component)** renders the six **stateless** atoms
  (`Badge`, `Card`, `Input`, `Separator`, `Textarea`, `Spinner`) directly on the
  server, imported through their #80 deep-import subpaths. If any atom regressed
  into needing a client boundary (a hook/context added without `"use client"`,
  or the build dropping per-file directives), this route fails to prerender and
  `next build` errors.
- **`app/ClientPanel.tsx` (`"use client"`)** renders the client atoms — hooks,
  context, Base UI primitives — including `Avatar` and `Combobox`, the two atoms
  that call `createContext` at module scope (the original D14 RSC crash).

So a green `next build` means: stateless atoms are server-renderable, client
atoms carry their directive, and the deep-import subpaths resolve under Next's
resolver.

## Run

```bash
# from the repo root — build the library first (the consumer contract):
pnpm build
pnpm --filter @examples/next-rsc build   # === the RSC regression net
```

CI runs this as the `rsc-consumer` job (PR-gating, browser-free — like the a11y
runner it never gates an npm publish). Never published.

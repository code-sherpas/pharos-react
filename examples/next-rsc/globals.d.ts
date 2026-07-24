// The CSS-contract side-effect imports resolve to real files at build time but
// ship no TypeScript declarations, so `next build`'s type check (stricter than
// Vite's) reports TS2882 on them. Declaring the modules is the same one-liner a
// real TypeScript consumer adds. (Tracked upstream: `pharos-tokens` should ship
// a `css.d.ts` — see the Pharos "Tareas" backlog.)
declare module '@code-sherpas/pharos-tokens/css';
declare module '@code-sherpas/pharos-react/styles.css';

/// <reference types="vite/client" />

// `vite/client` ambient-declares `*.css` file imports, which covers
// `@code-sherpas/pharos-react/styles.css` and the local `./styles.css`.
// It does NOT cover `@code-sherpas/pharos-tokens/css`, because that is a bare
// package subpath (`/css`), not a `*.css` file specifier — the tokens package
// ships no type stub for it. A real TypeScript consumer hits the same
// TS2882 and needs this same shim. FINDING: pharos-tokens should ship a
// `css.d.ts` (or map the `/css` export to one) so consumers don't need this.
declare module '@code-sherpas/pharos-tokens/css';

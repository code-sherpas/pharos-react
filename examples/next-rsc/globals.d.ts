// `@code-sherpas/pharos-tokens/css` ships no declarations up to pharos-tokens
// 1.0.0, and Next's own `declare module '*.css'` does not reach a path that
// does not end in `.css`, so `next build`'s type check (TS 6,
// `noUncheckedSideEffectImports` on by default) reports TS2882 without this
// one-liner. pharos-tokens#209 ships them; remove this file once this harness
// depends on that release. (`@code-sherpas/pharos-react/styles.css` needs
// nothing: it ships its own declarations, checked by `pnpm verify:dist-types`.)
declare module '@code-sherpas/pharos-tokens/css';

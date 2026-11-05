---
'@code-sherpas/pharos-react': patch
---

`@code-sherpas/pharos-react/styles.css` now ships type declarations (a `types` condition pointing to an empty `styles.css.d.ts`). Its side-effect import type-checks with `noUncheckedSideEffectImports` (on by default since TypeScript 6) even without a bundler's `declare module '*.css'`, for example in a plain `tsc` check.

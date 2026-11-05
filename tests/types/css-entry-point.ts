// Type-only check, run by `pnpm typecheck` (not by Vitest): a consumer's
// TypeScript must resolve the stylesheet entry point with
// `noUncheckedSideEffectImports`, on by default since TypeScript 6. The import
// self-references this package, so it goes through its `exports` map exactly
// as it does in a consumer.
import '@code-sherpas/pharos-react/styles.css';

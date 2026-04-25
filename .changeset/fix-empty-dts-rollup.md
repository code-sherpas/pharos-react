---
'@code-sherpas/pharos-react': patch
---

Fix `dist/index.d.ts` shipping as an empty `export {}` — every previously published release (0.1.0, 0.2.0, 0.2.1) failed to expose `Button`, `ButtonProps`, `PharosHello`, `cn` to TypeScript consumers. Root cause: `vite-plugin-dts` with `rollupTypes: true` uses API Extractor, which does not yet support TypeScript 6 and silently produces an empty barrel. Disabled `rollupTypes` and added a dedicated `tsconfig.build.json` (with `rootDir: src`) so per-file declarations are emitted directly under `dist/` and the public exports resolve correctly. No runtime change.

---
'@code-sherpas/pharos-react': patch
---

Fix `dist/index.d.ts` shipping as an empty `export {}` — every previously published release (0.1.0, 0.2.0, 0.2.1) failed to expose `Button`, `ButtonProps`, `PharosHello`, `cn` to TypeScript consumers. Root cause: `vite-plugin-dts` with `rollupTypes: true` uses API Extractor, which silently fails when TypeScript is newer than its bundled compiler engine and produces an empty barrel. Disabled `rollupTypes` and added a dedicated `tsconfig.build.json` (`rootDir: src`) so per-file declarations are emitted directly under `dist/` and the public exports resolve correctly. No runtime change.

Also wires a `verify:dist-types` smoke check directly into `pnpm build`: a tiny consumer file under `tests/dist-types-smoke.ts` imports every public symbol from the built `dist/` and is type-checked with a dedicated `tsconfig.dist-smoke.json`. Any future regression that ships an empty / incomplete barrel — for any reason — fails the build step (and therefore CI, `prepublishOnly`, and local builds) before a release can be cut.

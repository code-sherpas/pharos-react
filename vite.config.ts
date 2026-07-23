import { defineConfig } from 'vite';
import { resolve } from 'node:path';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    react(),
    dts({
      tsconfigPath: 'tsconfig.build.json',
      // rollupTypes is intentionally off: API Extractor (used by
      // vite-plugin-dts to merge declarations) does not yet support
      // TypeScript 6, and silently emits an empty `export {}` as
      // dist/index.d.ts. Per-file declarations from tsconfig.build.json
      // (rootDir = src) keep dist mirroring the src layout, so
      // package.json's `./dist/index.d.ts` resolves correctly.
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      formats: ['es'],
      cssFileName: 'styles',
    },
    rollupOptions: {
      external: [
        'react',
        'react-dom',
        'react/jsx-runtime',
        '@code-sherpas/pharos-tokens',
        /^@code-sherpas\/pharos-tokens\//,
        '@base-ui/react',
        /^@base-ui\/react\//,
        // Runtime `dependencies` (installed transitively for consumers). With
        // `preserveModules` an inlined dep would otherwise be emitted under
        // `dist/node_modules/…` and referenced by a relative path — but `npm
        // pack` strips every `node_modules` folder, so that path would dangle
        // in the published tarball. Keeping them external ships bare specifiers
        // that resolve from the consumer's install (#80).
        'class-variance-authority',
        'clsx',
      ],
      output: {
        // Per-component RSC granularity (#80): preserve the src module graph
        // so each atom ships as its own file (`dist/components/Button.js`),
        // carrying its own per-file `"use client"` directive where needed.
        // Stateless atoms (Card / Separator / …) ship without it and stay
        // server-renderable. Replaces the old blanket `banner: "'use client'"`.
        preserveModules: true,
        preserveModulesRoot: 'src',
        entryFileNames: '[name].js',
      },
    },
    cssCodeSplit: false,
    sourcemap: true,
  },
});

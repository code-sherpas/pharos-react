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
      fileName: () => 'index.js',
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
      ],
      output: {
        // Bundle banner that marks the published ESM module as client-only.
        // Avatar (D14) calls `createContext` at module top level; without
        // this directive, Next.js evaluates the module during RSC
        // build-time analysis and fails with
        // `TypeError: (0 , c.createContext) is not a function` while
        // collecting page data. The whole library shipping as client-only
        // matches what every React DS does (MUI, Chakra, Radix, shadcn).
        // The atoms that have no hooks (Card / Separator) lose
        // server-render-ability as a side effect — acceptable; consumers
        // were never asked to render them as Server Components anyway.
        banner: "'use client';",
      },
    },
    cssCodeSplit: false,
    sourcemap: true,
  },
});

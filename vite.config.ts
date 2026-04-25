import { defineConfig } from 'vite';
import { resolve } from 'node:path';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
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
    },
    cssCodeSplit: false,
    sourcemap: true,
  },
});

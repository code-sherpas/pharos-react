import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// A plain React SPA — deliberately NOT library mode. It imports
// `@code-sherpas/pharos-react` from the workspace, which resolves to the
// package `exports` (dist/), so this app builds against the published
// artifact, not the library source.
export default defineConfig({
  plugins: [react()],
  server: { port: 4173, strictPort: true },
  preview: { port: 4173, strictPort: true },
});

import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const rootDir = dirname(fileURLToPath(import.meta.url));

// Two Vitest projects, selected via `--project`:
//   • unit      → the Testing Library suite under tests/ (jsdom, fast).
//                 This is what `pnpm test` runs, in CI and at release.
//   • storybook → every *.stories.tsx rendered in a real browser by
//                 addon-vitest and scanned by axe. This is what makes the
//                 `a11y.test: 'error'` parameter in .storybook/preview.ts
//                 actually fail on violations — jsdom cannot compute the
//                 layout/roles axe needs. Run via `pnpm test:storybook`
//                 (needs Playwright's Chromium installed).
export default defineConfig({
  test: {
    projects: [
      {
        plugins: [react()],
        test: {
          name: 'unit',
          include: [
            'tests/**/*.test.ts',
            'tests/**/*.test.tsx',
            'src/**/*.test.ts',
            'src/**/*.test.tsx',
          ],
          globals: false,
          environment: 'jsdom',
          setupFiles: ['./tests/setup.ts'],
        },
      },
      {
        plugins: [storybookTest({ configDir: join(rootDir, '.storybook') })],
        test: {
          name: 'storybook',
          browser: {
            enabled: true,
            provider: playwright({}),
            headless: true,
            instances: [{ browser: 'chromium' }],
          },
          // No setupFiles: since Storybook 10.3 addon-vitest applies the
          // preview.ts annotations (token CSS, font loaders, a11y config)
          // automatically. A manual setProjectAnnotations here would only
          // conflict with that.
        },
      },
    ],
  },
});

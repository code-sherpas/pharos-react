import { defineConfig, devices } from '@playwright/test';

const PORT = 4173;
const isCI = !!process.env.CI;

/**
 * Playwright drives the built SaaS demo. In CI the app is pre-built
 * (`vite build`) and served with `vite preview` — the same static bundle a
 * real deploy would serve, importing Pharos from `dist/`. Locally it falls
 * back to the dev server for a fast loop. Either way the lib must be built
 * first (`pnpm build` at the repo root) so the workspace `dist/` exists.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 1 : 0,
  reporter: isCI ? [['html', { open: 'never' }], ['list']] : 'list',
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: isCI ? 'pnpm preview' : 'pnpm dev',
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !isCI,
    timeout: 120_000,
  },
});

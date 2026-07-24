import { defineConfig, devices } from '@playwright/test';

const PORT = 3100;
const isCI = !!process.env.CI;

/**
 * Runtime smoke for the Next.js RSC consumer. `next build` (the `rsc-consumer`
 * CI step) proves the app *compiles* across the server/client boundary; this
 * drives the *running* app to catch what a build cannot — hydration mismatches
 * and post-hydration interactivity of the client atoms under Next.
 *
 * In CI the app is pre-built (`next build`) and served with `next start` (the
 * production server — the mode where a hydration mismatch actually surfaces).
 * Locally it falls back to `next dev`. Either way the library must be built
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
    command: isCI ? 'pnpm start' : 'pnpm dev',
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !isCI,
    timeout: 120_000,
  },
});

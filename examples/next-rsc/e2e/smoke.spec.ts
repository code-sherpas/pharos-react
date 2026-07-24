import { test, expect } from '@playwright/test';

/**
 * The RSC runtime smoke. Complements the `next build` compile check with what a
 * build cannot see: that the server-rendered atoms actually reach the browser,
 * that the client atoms hydrate and stay interactive, and that hydration
 * produces no console/page errors (a mismatch between the server and client
 * render surfaces here, not at build time). This is the Next-specific axis the
 * Vite saas-demo harness structurally cannot cover.
 */
test.describe('RSC runtime smoke', () => {
  test('server-renders stateless atoms and hydrates client atoms without errors', async ({
    page,
  }) => {
    const consoleErrors: string[] = [];
    const pageErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });
    page.on('pageerror', (err) => pageErrors.push(err.message));

    await page.goto('/');

    // (1) Rendered by the Server Component (stateless atoms, no client boundary).
    await expect(page.getByRole('heading', { name: 'Pharos RSC harness' })).toBeVisible();
    await expect(page.getByText('Server Component')).toBeVisible(); // CardTitle
    await expect(page.getByText('Server', { exact: true })).toBeVisible(); // Badge

    // (2) A client atom hydrated and is interactive: the Switch toggles.
    const toggle = page.getByRole('switch', { name: 'Notifications' });
    await expect(toggle).toHaveAttribute('aria-checked', 'true'); // defaultChecked
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-checked', 'false');

    // (3) A Base UI overlay opens post-hydration (portal + client behavior).
    await page.getByRole('button', { name: 'Invite' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByText('Invite teammate')).toBeVisible();

    // (4) No hydration mismatch — no console errors, no uncaught page errors.
    expect(pageErrors, `unexpected page errors:\n${pageErrors.join('\n')}`).toHaveLength(0);
    expect(consoleErrors, `unexpected console errors:\n${consoleErrors.join('\n')}`).toHaveLength(
      0,
    );
  });
});

import { test, expect } from '@playwright/test';

// F0 smoke test: proves the whole harness pipeline works end-to-end — the
// library builds to dist/, the demo consumes it (barrel + styles.css +
// tokens/css), and a real user flow across composed Pharos atoms behaves.
// Selectors use ARIA roles and the stable `data-pharos-*` attributes, never
// hashed CSS Module class names (AGENTS.md → "Authoring a component").

test.describe('Login flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('renders the login card composed from Pharos atoms', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
    // The submit Button resolves its variant to the stable data attribute.
    const submit = page.getByRole('button', { name: 'Sign in' });
    await expect(submit).toHaveAttribute('data-pharos-intent', 'primary');
  });

  test('shows a validation error when submitting empty', async ({ page }) => {
    await page.getByRole('button', { name: 'Sign in' }).click();
    await expect(page.getByRole('alert')).toHaveText(/enter both your email and password/i);
    // Input reflects the error through aria-invalid (D10 WCAG borders).
    await expect(page.getByLabel('Email')).toHaveAttribute('aria-invalid', 'true');
  });

  test('signs in with valid credentials and reaches the dashboard', async ({ page }) => {
    await page.getByLabel('Email').fill('ada@nimbus.io');
    await page.getByLabel('Password').fill('correct-horse');
    await page.getByRole('button', { name: /sign in/i }).click();

    // Dashboard confirms the composed post-auth screen rendered.
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
    await expect(page.getByText('ada@nimbus.io')).toBeVisible();
    await expect(page.getByText('On track')).toBeVisible();
  });
});

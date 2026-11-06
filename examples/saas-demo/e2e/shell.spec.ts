import { test, expect } from '@playwright/test';
import { signIn } from './helpers';

// Exercises the composed overlays in the top bar: the account DropdownMenu
// (Avatar-in-IconButton trigger) and the notifications Popover. Guards focus
// return, Escape-to-close and cross-component navigation.
test.describe('App shell', () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page);
  });

  test('account menu navigates to Settings', async ({ page }) => {
    await page.getByRole('button', { name: 'Account menu' }).click();
    await page.getByRole('menuitem', { name: 'Settings' }).click();
    await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible();
  });

  test('notifications popover opens and closes with Escape', async ({ page }) => {
    await page.getByRole('button', { name: 'Notifications' }).click();
    await expect(page.getByRole('heading', { name: 'Notifications' })).toBeVisible();
    await expect(page.getByText(/Grace commented/)).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('heading', { name: 'Notifications' })).toHaveCount(0);
  });

  test('language picker shows the languages icon and switches the interface language', async ({
    page,
  }) => {
    const picker = page.getByRole('button', { name: 'Language: English' });
    const icon = picker.locator('[data-pharos-icon="languages"]');
    await expect(icon).toHaveAttribute('aria-hidden', 'true');
    const box = await icon.boundingBox();
    expect(box?.width ?? 0).toBeGreaterThan(0);

    await picker.click();
    await page.getByRole('menuitem', { name: 'Español' }).click();
    await expect(page.getByRole('button', { name: 'Language: Español' })).toBeVisible();
  });

  test('sign out returns to the login screen', async ({ page }) => {
    await page.getByRole('button', { name: 'Account menu' }).click();
    await page.getByRole('menuitem', { name: 'Sign out' }).click();
    await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible();
  });
});

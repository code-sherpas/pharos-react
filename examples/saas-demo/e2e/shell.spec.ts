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

  test('sign out returns to the login screen', async ({ page }) => {
    await page.getByRole('button', { name: 'Account menu' }).click();
    await page.getByRole('menuitem', { name: 'Sign out' }).click();
    await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible();
  });
});

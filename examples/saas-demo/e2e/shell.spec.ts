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

  test('language picker opens a select from an icon button and switches the interface language', async ({
    page,
  }) => {
    const picker = page.getByRole('combobox', { name: 'Language: English' });
    await expect(picker).toHaveAttribute('data-pharos-intent', 'ghost');
    // Only the languages icon: no field chevron.
    await expect(picker.locator('svg')).toHaveCount(1);
    const icon = picker.locator('[data-pharos-icon="languages"]');
    await expect(icon).toHaveAttribute('aria-hidden', 'true');
    expect((await icon.boundingBox())?.width ?? 0).toBeGreaterThan(0);

    await picker.click();
    const listbox = page.getByRole('listbox');
    await expect(listbox).toBeVisible();
    // The list is wider than the 40px button: every option on one line.
    for (const name of ['English', 'Español', 'Français']) {
      const lines = await page.getByRole('option', { name }).evaluate(function countLines(el) {
        const text = el.firstElementChild ?? el;
        return Math.round(
          text.getBoundingClientRect().height / parseFloat(getComputedStyle(el).lineHeight),
        );
      });
      expect(lines, `«${name}» should fit on one line`).toBe(1);
    }
    await page.getByRole('option', { name: 'Español' }).click();
    const renamed = page.getByRole('combobox', { name: 'Language: Español' });
    await expect(renamed).toBeVisible();

    // Keyboard: Escape closes it and focus goes back to the icon button.
    await renamed.click();
    await expect(listbox).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(listbox).toBeHidden();
    await expect(renamed).toBeFocused();
  });

  test('sign out returns to the login screen', async ({ page }) => {
    await page.getByRole('button', { name: 'Account menu' }).click();
    await page.getByRole('menuitem', { name: 'Sign out' }).click();
    await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible();
  });
});

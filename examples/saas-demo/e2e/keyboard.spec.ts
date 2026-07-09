import { test, expect } from '@playwright/test';
import { signIn } from './helpers';

// Keyboard operability across composed overlays: opening with the keyboard
// focuses the first item, and roving focus + Enter activates it. This is the
// ARIA APG menu-button contract exercised in a real page.
test.describe('Keyboard operation', () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page);
  });

  test('account menu opens and activates the first item with the keyboard', async ({ page }) => {
    const trigger = page.getByRole('button', { name: 'Account menu' });
    await trigger.focus();
    await page.keyboard.press('Enter');
    // Keyboard-open focuses the first menu item (Settings).
    await expect(page.getByRole('menuitem', { name: 'Settings' })).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible();
  });

  test('account menu roves focus with the arrow keys', async ({ page }) => {
    const trigger = page.getByRole('button', { name: 'Account menu' });
    await trigger.focus();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('menuitem', { name: 'Settings' })).toBeFocused();
    await page.keyboard.press('ArrowDown');
    await expect(page.getByRole('menuitem', { name: 'Team' })).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('heading', { name: 'Team' })).toBeVisible();
  });
});

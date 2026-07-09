import { test, expect } from '@playwright/test';
import { signIn } from './helpers';

// The focus-return contract: every Pharos overlay moves focus into itself on
// open and returns it to the trigger on Escape (the Base UI focus-guard
// pattern the preview.ts a11y config deliberately excludes from axe). A
// regression here is invisible to unit/Storybook/Chromatic but breaks keyboard
// users — exactly what the harness is for.
test.describe('Overlay focus return', () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page);
  });

  test('DropdownMenu returns focus to its trigger on Escape', async ({ page }) => {
    const trigger = page.getByRole('button', { name: 'Account menu' });
    await trigger.click();
    await expect(page.getByRole('menuitem', { name: 'Settings' })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('menuitem', { name: 'Settings' })).toHaveCount(0);
    await expect(trigger).toBeFocused();
  });

  test('Popover returns focus to its trigger on Escape', async ({ page }) => {
    const trigger = page.getByRole('button', { name: 'Notifications' });
    await trigger.click();
    await expect(page.getByRole('heading', { name: 'Notifications' })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('heading', { name: 'Notifications' })).toHaveCount(0);
    await expect(trigger).toBeFocused();
  });

  test('Select returns focus to its trigger on Escape', async ({ page }) => {
    await page.getByRole('button', { name: 'Settings' }).click();
    const trigger = page.getByRole('combobox', { name: 'Profile visibility' });
    await trigger.click();
    await expect(page.getByRole('option', { name: 'Public' })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('option', { name: 'Public' })).toHaveCount(0);
    await expect(trigger).toBeFocused();
  });
});

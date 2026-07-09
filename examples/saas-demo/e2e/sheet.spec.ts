import { test, expect } from '@playwright/test';
import { signIn } from './helpers';

// The Sheet (modal drawer) and — critically — a Select opened from INSIDE it.
// That nested-overlay case is the reason Sheet shares the popover z-index
// layer; if the layering regressed, the option below would be behind the
// panel and unclickable. This is the LanguageSelector-in-a-drawer scenario.
test.describe('New project sheet', () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page);
  });

  test('opens, and a Select inside it stacks above the panel', async ({ page }) => {
    await page.getByRole('button', { name: 'New project' }).click();
    await expect(page.getByRole('dialog', { name: 'New project' })).toBeVisible();

    const select = page.getByRole('combobox', { name: 'Visibility' });
    await select.click();
    await page.getByRole('option', { name: 'Public' }).click();
    await expect(select).toHaveText(/public/i);

    await page.getByRole('button', { name: 'Cancel' }).click();
    await expect(page.getByRole('dialog', { name: 'New project' })).toHaveCount(0);
  });

  test('closes on Escape and returns focus to the trigger', async ({ page }) => {
    const trigger = page.getByRole('button', { name: 'New project' });
    await trigger.click();
    await expect(page.getByRole('dialog', { name: 'New project' })).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog', { name: 'New project' })).toHaveCount(0);
    await expect(trigger).toBeFocused();
  });
});

import { test, expect } from '@playwright/test';
import { signIn } from './helpers';

// The Dialog (centered modal) and — critically — a Select opened from INSIDE
// it. Same nested-overlay z-index case as the Sheet, in the centered shape:
// if layering regressed, the option below would be behind the panel and
// unclickable.
test.describe('Invite dialog', () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page);
  });

  test('opens, and a Select inside it stacks above the panel', async ({ page }) => {
    await page.getByRole('button', { name: 'Invite teammate' }).click();
    await expect(page.getByRole('dialog', { name: 'Invite teammate' })).toBeVisible();

    const select = page.getByRole('combobox', { name: 'Role' });
    await select.click();
    await page.getByRole('option', { name: 'Admin' }).click();
    await expect(select).toHaveText(/admin/i);

    await page.getByRole('button', { name: 'Cancel' }).click();
    await expect(page.getByRole('dialog', { name: 'Invite teammate' })).toHaveCount(0);
  });

  test('closes on Escape and returns focus to the trigger', async ({ page }) => {
    const trigger = page.getByRole('button', { name: 'Invite teammate' });
    await trigger.click();
    await expect(page.getByRole('dialog', { name: 'Invite teammate' })).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog', { name: 'Invite teammate' })).toHaveCount(0);
    await expect(trigger).toBeFocused();
  });
});

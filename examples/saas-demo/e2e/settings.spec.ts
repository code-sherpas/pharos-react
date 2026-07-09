import { test, expect } from '@playwright/test';
import { signIn } from './helpers';

// Every form atom composed on one page: Input validation, the Select listbox,
// and the multi-select Combobox chips.
test.describe('Settings form', () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page);
    await page.getByRole('button', { name: 'Settings' }).click();
    await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible();
  });

  test('validates the required display name', async ({ page }) => {
    await page.getByLabel('Display name').fill('');
    await page.getByRole('button', { name: 'Save changes' }).click();
    await expect(page.getByRole('alert')).toHaveText(/display name is required/i);
    await expect(page.getByLabel('Display name')).toHaveAttribute('aria-invalid', 'true');
  });

  test('selects a profile visibility from the listbox', async ({ page }) => {
    const trigger = page.getByRole('combobox', { name: 'Profile visibility' });
    await trigger.click();
    await page.getByRole('option', { name: 'Public' }).click();
    await expect(trigger).toHaveText(/public/i);
  });

  test('removes a skill chip in the multi-select combobox', async ({ page }) => {
    await expect(page.getByText('React', { exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Remove' }).click();
    await expect(page.getByText('React', { exact: true })).toHaveCount(0);
  });

  test('saves valid settings', async ({ page }) => {
    await page.getByLabel('Display name').fill('Ada L.');
    await page.getByRole('button', { name: 'Save changes' }).click();
    await expect(page.getByText(/settings saved/i)).toBeVisible();
  });
});

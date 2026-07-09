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

  test('filters and picks a value in the single-select combobox', async ({ page }) => {
    const input = page.getByRole('combobox', { name: 'Timezone' });
    await input.click();
    await input.fill('Mad');
    // Typing narrows the list to matching options only.
    await expect(page.getByRole('option', { name: 'Europe/Madrid' })).toBeVisible();
    await expect(page.getByRole('option', { name: 'UTC' })).toHaveCount(0);
    await page.getByRole('option', { name: 'Europe/Madrid' }).click();
    await expect(input).toHaveValue('Europe/Madrid');
  });

  test('filters and adds a chip in the multi-select combobox', async ({ page }) => {
    const input = page.getByRole('combobox', { name: 'Skills' });
    await input.click();
    await input.fill('Type');
    await expect(page.getByRole('option', { name: 'TypeScript' })).toBeVisible();
    await page.getByRole('option', { name: 'TypeScript' }).click();
    // The selection becomes a chip alongside the initial one. Scope to the
    // chip slot: the popup stays open, so the option text is still on screen.
    const chips = page.locator('[data-pharos-slot="combobox-chip"]');
    await expect(chips.filter({ hasText: 'TypeScript' })).toHaveCount(1);
    await expect(chips.filter({ hasText: 'React' })).toHaveCount(1);
  });
});

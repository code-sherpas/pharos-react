import { test, expect } from '@playwright/test';
import { signIn } from './helpers';

// The per-row DropdownMenu (kebab IconButton) inside a list, plus a
// destructive action that mutates the list.
test.describe('Team page', () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page);
    // exact: to avoid matching the Dashboard's "Invite teammate" button.
    await page.getByRole('button', { name: 'Team', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Team' })).toBeVisible();
  });

  test('lists team members', async ({ page }) => {
    await expect(page.getByText('Ada Lovelace')).toBeVisible();
    await expect(page.getByText('Grace Hopper')).toBeVisible();
  });

  test('removes a member through the row action menu', async ({ page }) => {
    await expect(page.getByText('Alan Turing', { exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Actions for Alan Turing' }).click();
    await page.getByRole('menuitem', { name: 'Remove from team' }).click();
    await expect(page.getByText('Alan Turing removed from the team.')).toBeVisible();
    await expect(page.getByText('Alan Turing', { exact: true })).toHaveCount(0);
  });
});

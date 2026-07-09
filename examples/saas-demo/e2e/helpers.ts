import { expect, type Page } from '@playwright/test';

/** Sign in and land on the Dashboard — the entry point for shell/page specs. */
export async function signIn(page: Page, email = 'ada@nimbus.io') {
  await page.goto('/');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill('correct-horse');
  await page.getByRole('button', { name: /sign in/i }).click();
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
}

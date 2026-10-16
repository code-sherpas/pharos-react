import { test, expect } from '@playwright/test';
import { layerAtTheCorner, layerOf, signIn } from './helpers';

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

  // D29: backdrop and panel share the modal layer, so a modal opened over
  // another one covers it, backdrop included; the Select's list sits on the
  // popover layer above both.
  test('its backdrop shares the panel layer and a Select list sits above it', async ({ page }) => {
    await page.getByRole('button', { name: 'Invite teammate' }).click();
    const panel = page.getByRole('dialog', { name: 'Invite teammate' });
    await expect(panel).toBeVisible();

    const panelLayer = await layerOf(panel);
    expect(await layerAtTheCorner(page)).toBe(panelLayer);

    await page.getByRole('combobox', { name: 'Role' }).click();
    const list = page.getByRole('listbox');
    await expect(list).toBeVisible();
    expect(await layerOf(list)).toBeGreaterThan(panelLayer);
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

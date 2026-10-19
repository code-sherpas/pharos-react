import { test, expect, type Page } from '@playwright/test';
import { layerOf, signIn } from './helpers';

// Toast composed the way a consumer mounts it: one ToastProvider and one
// Toaster (top-center) at the root, raised from a page, from a row menu and
// from inside a modal Dialog.

async function saveSettings(page: Page) {
  await page.getByRole('button', { name: 'Settings' }).click();
  await page.getByRole('button', { name: 'Save changes' }).click();
}

test.describe('Toast', () => {
  test('confirms a save at the top centre, inside the named region', async ({ page }) => {
    await signIn(page);
    await saveSettings(page);

    const region = page.getByRole('region', { name: 'Notifications' });
    const toast = region.getByRole('dialog', { name: 'Settings saved.' });
    await expect(toast).toBeVisible();
    await expect(toast).toHaveAttribute('data-pharos-variant', 'success');

    const box = (await toast.boundingBox())!;
    const width = page.viewportSize()!.width;
    expect(Math.abs(box.x + box.width / 2 - width / 2)).toBeLessThan(2);
    expect(box.y).toBeLessThan(40);
  });

  test('saving twice refreshes the toast instead of stacking a second', async ({ page }) => {
    await signIn(page);
    await saveSettings(page);
    await page.getByRole('button', { name: 'Save changes' }).click();

    await expect(page.getByRole('dialog', { name: 'Settings saved.' })).toHaveCount(1);
  });

  test('raised from inside a modal, it paints above it and can be closed', async ({ page }) => {
    await signIn(page);
    await page.getByRole('button', { name: 'Invite teammate' }).click();
    const panel = page.getByRole('dialog', { name: 'Invite teammate' });
    await panel.getByRole('button', { name: 'Copy invite link' }).click();

    const toast = page.getByRole('dialog', { name: 'Invite link copied.' });
    await expect(toast).toBeVisible();
    expect(await layerOf(toast)).toBeGreaterThan(await layerOf(panel));

    await toast.hover();
    await toast.getByRole('button', { name: 'Close' }).click();
    await expect(toast).toHaveCount(0);
    await expect(panel).toBeVisible();
  });

  test('F6 takes the keyboard to the toasts, and Tab to its close button', async ({ page }) => {
    await signIn(page);
    await saveSettings(page);
    const toast = page.getByRole('dialog', { name: 'Settings saved.' });
    await expect(toast).toBeVisible();

    await page.keyboard.press('F6');
    await expect(page.getByRole('region', { name: 'Notifications' })).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(toast).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(toast.getByRole('button', { name: 'Close' })).toBeFocused();
    await page.keyboard.press('Enter');

    await expect(toast).toHaveCount(0);
  });

  test('goes away on its own after seven seconds', async ({ page }) => {
    await page.clock.install();
    await signIn(page);
    await saveSettings(page);
    const toast = page.getByRole('dialog', { name: 'Settings saved.' });
    await expect(toast).toBeVisible();
    // Off the toasts: the pointer over them pauses the timer.
    await page.mouse.move(5, 500);

    await page.clock.runFor(6000);
    await expect(toast).toBeVisible();
    await page.clock.runFor(2000);
    await expect(toast).toHaveCount(0);
  });

  test('waits while the pointer rests on it, and resumes when it leaves', async ({ page }) => {
    await page.clock.install();
    await signIn(page);
    await saveSettings(page);
    const toast = page.getByRole('dialog', { name: 'Settings saved.' });
    await expect(toast).toBeVisible();

    await toast.hover();
    await page.clock.runFor(20000);
    await expect(toast).toBeVisible();

    await page.mouse.move(5, 500);
    await page.clock.runFor(8000);
    await expect(toast).toHaveCount(0);
  });

  test('on the narrowest phone it fits, and a long message wraps', async ({ page }, testInfo) => {
    await page.setViewportSize({ width: 320, height: 700 });
    await signIn(page);
    // The longest message in the harness: a removal with its Undo.
    await page.getByRole('button', { name: 'Team', exact: true }).click();
    await page.getByRole('button', { name: 'Actions for Grace Hopper' }).click();
    await page.getByRole('menuitem', { name: 'Remove from team' }).click();

    // The harness's own top bar overflows at 320 px; what is measured here is
    // the toast's region, which must sit inside the screen whatever the page.
    const region = page.getByRole('region', { name: 'Notifications' });
    const toast = region.getByRole('dialog', { name: 'Grace Hopper removed from the team.' });
    await expect(toast).toBeVisible();
    const box = (await toast.boundingBox())!;
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(320);

    // The title takes two lines rather than being cut, and Undo stays whole.
    const title = toast.getByText('Grace Hopper removed from the team.');
    const lineHeight = await title.evaluate((el) => parseFloat(getComputedStyle(el).lineHeight));
    expect((await title.boundingBox())!.height).toBeGreaterThan(lineHeight * 1.5);
    const undo = (await toast.getByRole('button', { name: 'Undo' }).boundingBox())!;
    expect(undo.x + undo.width).toBeLessThanOrEqual(box.x + box.width);
    await page.screenshot({ path: testInfo.outputPath('toast-320.png') });
  });
});

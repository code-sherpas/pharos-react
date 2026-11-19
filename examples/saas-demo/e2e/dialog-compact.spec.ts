import { test, expect, type Locator, type Page } from '@playwright/test';
import { signIn } from './helpers';

// A Dialog with a form taller than a phone («New pillar» on the Taxonomy
// page). Below `breakpoint.compact` (40rem) it fills the screen with its
// header and footer in view and only the fields scrolling between them;
// above it, it is the centered panel it always was. Crossing the breakpoint
// restyles the same dialog, so what was typed and the focus stay.
const PHONE = { width: 375, height: 812 };
const PHONE_TURNED = { width: 812, height: 375 };
const DESKTOP = { width: 1280, height: 800 };

async function openNewPillar(page: Page) {
  await signIn(page);
  await page.getByRole('button', { name: 'Taxonomy', exact: true }).click();
  const trigger = page.getByRole('button', { name: 'New pillar' });
  await trigger.click();
  const dialog = page.getByRole('dialog', { name: 'New pillar' });
  await expect(dialog).toBeVisible();
  // Wait for the opening motion to end before measuring.
  await dialog.evaluate(function settle(node) {
    return Promise.all(node.getAnimations().map((animation) => animation.finished));
  });
  return {
    trigger,
    dialog,
    header: dialog.locator('[data-pharos-slot="dialog-header"]'),
    footer: dialog.locator('[data-pharos-slot="dialog-footer"]'),
  };
}

/** Whether the centre of `target` is what the person sees at that point. */
function isOnTop(target: Locator): Promise<boolean> {
  return target.evaluate(function seenAtItsCentre(node) {
    const box = node.getBoundingClientRect();
    const seen = document.elementFromPoint(box.x + box.width / 2, box.y + box.height / 2);
    return seen !== null && (node === seen || node.contains(seen));
  });
}

function scrollTop(dialog: Locator): Promise<number> {
  return dialog.evaluate(function readScrollTop(node) {
    return node.scrollTop;
  });
}

test.describe('Dialog on a phone', () => {
  test.use({ viewport: PHONE });

  test('fills the screen, with no margin and no radius', async ({ page }) => {
    const { dialog } = await openNewPillar(page);
    await expect(dialog).toHaveAttribute('data-pharos-mode', 'fullscreen');
    expect(await dialog.boundingBox()).toEqual({ x: 0, y: 0, ...PHONE });
    await expect(dialog).toHaveCSS('border-radius', '0px');
  });

  test('only the body scrolls: the header and the footer stay in view', async ({ page }) => {
    const { dialog, header, footer } = await openNewPillar(page);
    const name = dialog.getByLabel('Name');
    const create = dialog.getByRole('button', { name: 'Create pillar' });

    // The form is taller than the screen, so there is something to scroll.
    const overflow = await dialog.evaluate(function overflowHeight(node) {
      return node.scrollHeight - node.clientHeight;
    });
    expect(overflow).toBeGreaterThan(0);

    const nameBefore = (await name.boundingBox())!;
    const headerBefore = (await header.boundingBox())!;
    const footerBefore = (await footer.boundingBox())!;
    expect(headerBefore.y).toBe(0);
    expect(footerBefore.y + footerBefore.height).toBe(PHONE.height);

    await dialog.hover();
    await page.mouse.wheel(0, 2000);
    await expect.poll(() => scrollTop(dialog)).toBe(overflow);

    // Header and footer did not move, and are on top of what scrolled.
    expect(await header.boundingBox()).toEqual(headerBefore);
    expect(await footer.boundingBox()).toEqual(footerBefore);
    expect(await isOnTop(dialog.getByRole('heading', { name: 'New pillar' }))).toBe(true);
    expect(await isOnTop(create)).toBe(true);
    // The body moved by what was scrolled, and its first field went under
    // the header.
    expect((await name.boundingBox())!.y).toBeCloseTo(nameBefore.y - overflow, 0);
    expect(await isOnTop(name)).toBe(false);
    await expect(dialog.getByLabel('Notes for reviewers')).toBeInViewport();

    // The page behind does not scroll with it.
    expect(await page.evaluate(() => window.scrollY)).toBe(0);
  });

  // WCAG 2.4.11: a field under the pinned header or footer is still inside
  // the scrolling panel, so without help the browser would leave it hidden
  // there when the keyboard reaches it.
  test('a field reached with the keyboard is not hidden under the header', async ({ page }) => {
    const { dialog, header } = await openNewPillar(page);
    const name = dialog.getByLabel('Name');
    // Scroll the first field to the middle of the header, where it is hidden.
    const nameBox = (await name.boundingBox())!;
    const headerBox = (await header.boundingBox())!;
    const under = nameBox.y + nameBox.height / 2 - (headerBox.y + headerBox.height / 2);
    await dialog.evaluate(function scrollBy(node, by) {
      node.scrollTop += by;
    }, under);
    expect(await isOnTop(name)).toBe(false);

    await dialog.getByLabel('Description').focus();
    await page.keyboard.press('Shift+Tab');
    await expect(name).toBeFocused();
    expect(await isOnTop(name)).toBe(true);
    expect((await name.boundingBox())!.y).toBeGreaterThanOrEqual(headerBox.y + headerBox.height);
  });

  test('a field reached with the keyboard is not hidden under the footer', async ({ page }) => {
    // A short phone, so a choice of «Applies to» can sit wholly under the footer.
    await page.setViewportSize({ width: PHONE.width, height: 500 });
    const { dialog, footer } = await openNewPillar(page);
    const everyone = dialog.getByRole('radio', { name: 'Everyone in the organisation' });
    const radioBox = (await everyone.boundingBox())!;
    const footerBox = (await footer.boundingBox())!;
    const under = radioBox.y + radioBox.height / 2 - (footerBox.y + footerBox.height / 2);
    await dialog.evaluate(function scrollBy(node, by) {
      node.scrollTop += by;
    }, under);
    expect(await isOnTop(everyone)).toBe(false);

    await dialog.getByLabel('Description').focus();
    await page.keyboard.press('Tab');
    await expect(everyone).toBeFocused();
    expect(await isOnTop(everyone)).toBe(true);
    const revealed = (await everyone.boundingBox())!;
    expect(revealed.y + revealed.height).toBeLessThanOrEqual(footerBox.y);
  });

  test('turning the phone keeps what was typed and the focus', async ({ page }) => {
    const { dialog } = await openNewPillar(page);
    const name = dialog.getByLabel('Name');
    await name.fill('Communication');
    const notes = dialog.getByLabel('Notes for reviewers');
    await notes.fill('Check it against the 2026 review.');
    await expect(notes).toBeFocused();

    // 812px wide is above the compact breakpoint: the centered panel.
    await page.setViewportSize(PHONE_TURNED);
    await expect(dialog).toHaveAttribute('data-pharos-mode', 'centered');
    await expect(notes).toBeFocused();
    await expect(name).toHaveValue('Communication');
    await expect(notes).toHaveValue('Check it against the 2026 review.');

    await page.setViewportSize(PHONE);
    await expect(dialog).toHaveAttribute('data-pharos-mode', 'fullscreen');
    await expect(notes).toBeFocused();
    await expect(name).toHaveValue('Communication');

    await dialog.getByRole('button', { name: 'Create pillar' }).click();
    await expect(dialog).toHaveCount(0);
    await expect(page.getByRole('treeitem', { name: /Communication/ })).toBeVisible();
  });

  test('keeps the modal contract: focus goes in, Escape closes, focus goes back', async ({
    page,
  }) => {
    const { trigger, dialog } = await openNewPillar(page);
    await expect(dialog.getByLabel('Name')).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(dialog).toHaveCount(0);
    await expect(trigger).toBeFocused();
  });
});

test.describe('Dialog on a desktop', () => {
  test.use({ viewport: DESKTOP });

  test('is the centered panel, as before', async ({ page }) => {
    const { trigger, dialog, header, footer } = await openNewPillar(page);
    await expect(dialog).toHaveAttribute('data-pharos-mode', 'centered');
    await expect(dialog).toHaveCSS('max-width', '512px');
    await expect(dialog).not.toHaveCSS('border-radius', '0px');
    const box = (await dialog.boundingBox())!;
    expect(box.width).toBe(512);
    expect(box.x + box.width / 2).toBeCloseTo(DESKTOP.width / 2, 0);
    expect(box.y + box.height / 2).toBeCloseTo(DESKTOP.height / 2, 0);
    // Header and footer are not pinned on a desktop.
    await expect(header).toHaveCSS('position', 'static');
    await expect(footer).toHaveCSS('position', 'static');

    await expect(dialog.getByLabel('Name')).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(dialog).toHaveCount(0);
    await expect(trigger).toBeFocused();
  });
});

// A confirmation is short and takes no typing: AlertDialog stays the centered
// panel on a phone, at 375 and at 320px.
test.describe('AlertDialog on a phone', () => {
  for (const width of [375, 320]) {
    test(`stays centered at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 812 });
      await signIn(page);
      await page.getByRole('button', { name: 'Team', exact: true }).click();
      await page.getByRole('button', { name: 'Actions for Alan Turing' }).click();
      await page.getByRole('menuitem', { name: 'Remove from team' }).click();
      const confirm = page.getByRole('alertdialog', { name: 'Remove Alan Turing from the team?' });
      await expect(confirm).toBeVisible();
      await confirm.evaluate(function settle(node) {
        return Promise.all(node.getAnimations().map((animation) => animation.finished));
      });

      await expect(confirm).not.toHaveAttribute('data-pharos-mode');
      await expect(confirm).not.toHaveCSS('border-radius', '0px');
      const box = (await confirm.boundingBox())!;
      expect(box.x).toBeGreaterThan(0);
      expect(box.width).toBeLessThan(width);
      expect(box.height).toBeLessThan(812);
      expect(box.x + box.width / 2).toBeCloseTo(width / 2, 0);
      expect(box.y + box.height / 2).toBeCloseTo(812 / 2, 0);
    });
  }
});

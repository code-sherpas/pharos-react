import AxeBuilder from '@axe-core/playwright';
import { test, expect, type Locator, type Page } from '@playwright/test';
import { signIn } from './helpers';

// Alert inside a form in a Dialog: on the Taxonomy page, editing the
// description of a behaviour already used in assessments shows a warning
// before the action of saving — in reading order and in focus order — and an
// informative note beside it, told apart without relying on colour.
async function openTheEditDialog(page: Page, behaviour: 'Paraphrases' | 'Leaves silence') {
  await signIn(page);
  await page.getByRole('button', { name: 'Taxonomy', exact: true }).click();
  const tree = page.getByRole('tree', { name: 'Competency taxonomy' });
  await tree.getByRole('treeitem', { name: /People$/ }).focus();
  // Down to the behaviours of «Active listening», opening each level.
  await page.keyboard.press('ArrowDown');
  for (let level = 0; level < 3; level++) {
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowRight');
  }
  if (behaviour === 'Leaves silence') await page.keyboard.press('ArrowDown');
  await expect(tree.getByRole('treeitem', { name: new RegExp(`${behaviour}$`) })).toBeFocused();
  await page.keyboard.press('Enter');
  await recordLiveRegionsAsTheyAreInserted(page);
  await page
    .getByRole('complementary', { name: behaviour })
    .getByRole('button', { name: 'Edit description' })
    .click();
  const dialog = page.getByRole('dialog', { name: 'Edit description' });
  await expect(dialog).toBeVisible();
  return dialog;
}

/**
 * Records, for every live region inserted from now on, the text it rendered
 * (`innerText`, which leaves out what is `visibility: hidden`) and its height
 * at the moment it went into the document. A region inserted together with
 * visible text is announced unreliably; one whose text shows after it is in
 * the document is a change inside a live region, which screen readers
 * announce.
 */
interface InsertedRegion {
  role: string;
  text: string;
  height: number;
}

function recordLiveRegionsAsTheyAreInserted(page: Page) {
  return page.evaluate(function watchInsertions() {
    const inserted: InsertedRegion[] = [];
    (window as unknown as { insertedRegions: typeof inserted }).insertedRegions = inserted;
    new MutationObserver(function recordRegions(mutations) {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (!(node instanceof Element)) continue;
          const regions = node.matches('[role="alert"], [role="status"]')
            ? [node]
            : [...node.querySelectorAll('[role="alert"], [role="status"]')];
          for (const region of regions) {
            inserted.push({
              role: region.getAttribute('role') ?? '',
              text: (region as HTMLElement).innerText,
              // Layout height, unaffected by the dialog's entry transform.
              height: (region as HTMLElement).offsetHeight,
            });
          }
        }
      }
    }).observe(document.body, { childList: true, subtree: true });
  });
}

function insertedRegions(page: Page) {
  return page.evaluate(function readInsertions() {
    return (window as unknown as { insertedRegions: InsertedRegion[] }).insertedRegions;
  });
}

/** Whether `first` comes before `second` in the document. */
async function precedes(first: Locator, second: Locator) {
  const other = await second.elementHandle();
  return first.evaluate(function comesBefore(node, otherNode) {
    return Boolean(node.compareDocumentPosition(otherNode!) & Node.DOCUMENT_POSITION_FOLLOWING);
  }, other);
}

test.describe('Alert in a form inside a dialog', () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test('warns before saving, with an informative note beside it', async ({ page }) => {
    const dialog = await openTheEditDialog(page, 'Paraphrases');

    // The warning is role="alert", the note role="status"; their titles are
    // headings under the dialog's own, with the consumer's words only.
    const warning = dialog.getByRole('alert');
    const note = dialog.getByRole('status');
    await expect(warning).toHaveAttribute('data-pharos-variant', 'warning');
    await expect(note).toHaveAttribute('data-pharos-variant', 'info');
    await expect(
      warning.getByRole('heading', { level: 3, name: 'Used in 7 assessments' }),
    ).toBeVisible();
    await expect(warning).toContainText(
      'Saving a different description changes what those assessments mean.',
    );
    await expect(
      note.getByRole('heading', { level: 3, name: 'Assessors read this description' }),
    ).toBeVisible();

    // Announced when it appears: both regions went into the document with
    // their text not yet rendered, and it showed after, as a change inside
    // them. They took their final size from the start, so nothing jumped.
    const inserted = await insertedRegions(page);
    expect(new Set(inserted.map((region) => region.role))).toEqual(new Set(['alert', 'status']));
    expect(inserted.filter((region) => region.text.trim() !== '')).toEqual([]);
    const warningHeight = await warning.evaluate(function layoutHeight(node) {
      return (node as HTMLElement).offsetHeight;
    });
    for (const region of inserted.filter((each) => each.role === 'alert')) {
      expect(region.height).toBe(warningHeight);
    }

    // Not colour alone: each carries its own icon besides its title.
    const warningIcon = warning.locator('[data-pharos-slot="alert-icon"]');
    const noteIcon = note.locator('[data-pharos-slot="alert-icon"]');
    await expect(warningIcon).toHaveAttribute('data-pharos-icon', 'triangle-alert');
    await expect(noteIcon).toHaveAttribute('data-pharos-icon', 'info');
    await expect(warningIcon).toHaveAttribute('aria-hidden', 'true');

    // The bar of the warning is the amber made for bars (pharos-tokens 1.3.0).
    const barColour = await warning.evaluate(function readBar(node) {
      return getComputedStyle(node).borderInlineStartColor;
    });
    const tokenColour = await page.evaluate(function readToken() {
      const probe = document.createElement('div');
      probe.style.color = 'var(--pharos-color-semantic-warning-border)';
      document.body.appendChild(probe);
      const colour = getComputedStyle(probe).color;
      probe.remove();
      return colour;
    });
    expect(barColour).toBe(tokenColour);

    // Reading order: the warning comes before the field and the save action.
    const field = dialog.getByLabel('Description');
    const save = dialog.getByRole('button', { name: 'Save' });
    expect(await precedes(warning, field)).toBe(true);
    expect(await precedes(warning, save)).toBe(true);

    // Focus order: the dialog opens on its first focus stop, the field, which
    // comes after the warning — nothing focusable is skipped past it — and
    // above it on screen; Shift+Tab from there wraps to Save, the last stop,
    // so no stop sits between the start of the dialog and the field.
    await expect(field).toBeFocused();
    const warningBox = (await warning.boundingBox())!;
    expect(warningBox.y + warningBox.height).toBeLessThanOrEqual((await field.boundingBox())!.y);
    await page.keyboard.press('Shift+Tab');
    await expect(save).toBeFocused();
    await field.focus();
    await page.keyboard.press('Tab');
    await expect(dialog.getByRole('button', { name: 'Cancel' })).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(save).toBeFocused();

    expect(
      (await new AxeBuilder({ page }).include('[role="dialog"]').analyze()).violations,
    ).toEqual([]);

    // Saving keeps the new description: the dialog closes and the detail shows it.
    await field.fill('Repeats in their own words what was said before answering');
    await save.click();
    await expect(dialog).toHaveCount(0);
    await expect(
      page.getByText('Repeats in their own words what was said before answering').first(),
    ).toBeVisible();
  });

  test('shows only the note when nothing was assessed yet', async ({ page }) => {
    const dialog = await openTheEditDialog(page, 'Leaves silence');

    await expect(dialog.getByRole('status')).toContainText('Assessors read this description');
    await expect(dialog.getByRole('alert')).toHaveCount(0);
  });
});

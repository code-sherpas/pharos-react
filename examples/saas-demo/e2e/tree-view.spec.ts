import AxeBuilder from '@axe-core/playwright';
import { test, expect, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { signIn } from './helpers';

// axe-core, followed by the configuration the TreeView contract gives
// consumers: label-content-name-mismatch keeps running on everything but the
// tree's items, whose visible text holds their description and their open
// children besides their label (the label is their accessible name).
const AXE_WITH_TREE_ITEMS_EXCLUDED = `${readFileSync(
  createRequire(import.meta.url).resolve('axe-core/axe.min.js'),
  'utf8',
)}
axe.configure({
  rules: [
    {
      id: 'label-content-name-mismatch',
      selector: '*:not([data-pharos-slot="tree-view-item"])',
    },
  ],
});`;

// The TreeView on the Taxonomy page: a five-level hierarchy walked with the
// keyboard, an element chosen to see its detail — beside the tree in the
// SidePanel on a wide screen, as a view of its own with «Back» on a narrow
// one — and focus back on the element chosen afterwards. Also: it reads at
// 320px with long names, without scrolling sideways.
const WIDE = { width: 1280, height: 800 };
const PHONE = { width: 320, height: 700 };

async function openTaxonomy(page: Page) {
  await signIn(page);
  await page.getByRole('button', { name: 'Taxonomy', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Competency taxonomy' })).toBeVisible();
}

const tree = (page: Page) => page.getByRole('tree', { name: 'Competency taxonomy' });
const item = (page: Page, name: string | RegExp) => tree(page).getByRole('treeitem', { name });

test.describe('TreeView with its detail beside it (wide screen)', () => {
  test.use({ viewport: WIDE });

  test('walks the branches with the keyboard and shows the detail of the element chosen', async ({
    page,
  }) => {
    await openTaxonomy(page);

    // One tab stop: the first element, since nothing is chosen.
    await item(page, /People$/).focus();
    await expect(item(page, /People$/)).toHaveAttribute('tabindex', '0');
    await expect(item(page, /People$/)).toHaveAttribute('aria-expanded', 'true');

    await page.keyboard.press('ArrowDown');
    const collaboration = item(page, /Collaboration across teams/);
    await expect(collaboration).toBeFocused();
    await expect(collaboration).toHaveAttribute('aria-level', '2');

    // → opens, → goes in, down to the fifth level.
    for (const name of [/Collaboration across teams/, /Feedback$/, /Active listening$/]) {
      await page.keyboard.press('ArrowRight');
      await expect(item(page, name)).toHaveAttribute('aria-expanded', 'true');
      await page.keyboard.press('ArrowRight');
    }
    const paraphrases = item(page, /Paraphrases$/);
    await expect(paraphrases).toBeFocused();
    await expect(paraphrases).toHaveAttribute('aria-level', '5');
    await expect(paraphrases).toHaveAccessibleDescription(/asks open questions/);

    // Walking does not choose; Enter does, and opens the detail beside.
    await expect(page.getByRole('complementary')).toHaveCount(0);
    await page.keyboard.press('Enter');
    await expect(paraphrases).toHaveAttribute('aria-selected', 'true');
    const panel = page.getByRole('complementary', { name: 'Paraphrases' });
    await expect(panel).toBeVisible();
    await expect(panel).toContainText('Inside: People › Collaboration across teams');
    await expect(tree(page)).toBeVisible();

    // Escape closes it, and focus is back on the element chosen.
    await page.keyboard.press('Escape');
    await expect(panel).toHaveCount(0);
    await expect(paraphrases).toBeFocused();

    // ← climbs to the parent, and closes it.
    await page.keyboard.press('ArrowLeft');
    await expect(item(page, /Active listening$/)).toBeFocused();
    await page.keyboard.press('ArrowLeft');
    await expect(item(page, /Active listening$/)).toHaveAttribute('aria-expanded', 'false');
    await expect(paraphrases).toHaveCount(0);
  });

  test('typing a letter goes to the next name that starts with it, not to the next level', async ({
    page,
  }) => {
    await openTaxonomy(page);
    await item(page, /People$/).focus();

    // Every label starts with its level badge; typing matches the name.
    await page.keyboard.press('d');
    await expect(item(page, /Delivery$/)).toBeFocused();
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(600);
    await page.keyboard.press('p');
    await expect(item(page, /Planning$/)).toBeFocused();
    // The badge is still part of the accessible name.
    await expect(item(page, /Planning$/)).toHaveAccessibleName('Category Planning');
  });

  test('passes axe with every branch open once the treeitem is excluded from label-in-name', async ({
    page,
  }) => {
    await openTaxonomy(page);
    const people = item(page, /People$/);
    await people.focus();
    // Open every branch, descriptions included.
    for (const name of [
      /People$/,
      /Collaboration across teams/,
      /Feedback$/,
      /Active listening$/,
    ]) {
      await item(page, name).focus();
      await page.keyboard.press('*');
    }
    await expect(item(page, /Paraphrases$/)).toBeVisible();

    const results = await new AxeBuilder({ page, axeSource: AXE_WITH_TREE_ITEMS_EXCLUDED })
      .include('[role="tree"]')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze();
    expect(results.violations).toEqual([]);
  });

  test('chooses with a click, and the chevron opens without choosing', async ({ page }) => {
    await openTaxonomy(page);
    const delivery = item(page, /Delivery$/);

    await delivery.locator('[data-pharos-slot="tree-view-item-toggle"]').click();
    await expect(delivery).toHaveAttribute('aria-expanded', 'true');
    await expect(delivery).toHaveAttribute('aria-selected', 'false');
    await expect(page.getByRole('complementary')).toHaveCount(0);

    await item(page, /Planning$/).click();
    await expect(page.getByRole('complementary', { name: 'Planning' })).toBeVisible();
    await expect(item(page, /Planning$/)).toHaveAttribute('aria-selected', 'true');
  });
});

test.describe('TreeView with its detail as a view of its own (phone)', () => {
  test.use({ viewport: PHONE });

  test('reads at 320px with long names, without scrolling sideways', async ({ page }) => {
    await openTaxonomy(page);
    const collaboration = item(page, /Collaboration across teams/);
    await collaboration.focus();
    await page.keyboard.press('*');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowRight');
    await expect(item(page, /Feedback$/)).toBeFocused();
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowRight');
    await expect(item(page, /Paraphrases$/)).toBeFocused();

    const overflow = await tree(page).evaluate(function sidewaysOverflow(node) {
      return node.scrollWidth - node.clientWidth;
    });
    expect(overflow).toBeLessThanOrEqual(0);
    const treeBox = (await tree(page).boundingBox())!;
    expect(treeBox.x + treeBox.width).toBeLessThanOrEqual(PHONE.width);
    // The long name wraps instead of being cut: its whole text is on screen.
    const name = collaboration.locator('[data-pharos-slot="tree-view-item-label"]').first();
    const nameBox = (await name.boundingBox())!;
    expect(nameBox.x + nameBox.width).toBeLessThanOrEqual(treeBox.x + treeBox.width);
    expect(nameBox.height).toBeGreaterThan(30);
  });

  test('shows the detail as a view of its own, and Back returns to the same element', async ({
    page,
  }) => {
    await openTaxonomy(page);
    await item(page, /Collaboration across teams/).focus();
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowRight');
    await expect(item(page, /Feedback$/)).toBeFocused();

    await page.keyboard.press(' ');

    await expect(tree(page)).toHaveCount(0);
    await expect(page.getByRole('heading', { name: 'Feedback', level: 1 })).toBeFocused();
    await expect(page.getByRole('dialog')).toHaveCount(0);

    await page.getByRole('button', { name: 'Back to the taxonomy' }).click();

    const feedback = item(page, /Feedback$/);
    await expect(feedback).toBeFocused();
    await expect(feedback).toHaveAttribute('aria-selected', 'true');
    await expect(feedback).toHaveAttribute('tabindex', '0');
    await expect(item(page, /Collaboration across teams/)).toHaveAttribute('aria-expanded', 'true');
  });
});

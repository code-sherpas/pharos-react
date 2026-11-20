import AxeBuilder from '@axe-core/playwright';
import { test, expect, type Locator, type Page } from '@playwright/test';
import { signIn } from './helpers';

// «Actions on an item», the Pharos pattern composed from Button and
// DropdownMenu, on the detail of a Taxonomy element. Beside the title (the
// SidePanel's on a wide screen, the h1 of the detail's own view on a narrow
// one), from none to four actions by element. Below `breakpoint.compact`
// (40rem): one or two show in a row; with more, only the principal one and a
// «More actions» menu button, with the destructive one last after a separator.
// From the breakpoint up, every action shows in a row that wraps.
const PHONE = { width: 375, height: 812 };
const TABLET = { width: 800, height: 812 };
const DESKTOP = { width: 1280, height: 800 };

/** How to reach each element from «People», with the keyboard. */
const KEYS_FROM_PEOPLE: Record<string, string[]> = {
  People: [],
  Feedback: ['ArrowDown', 'ArrowRight', 'ArrowRight'],
  Paraphrases: [
    'ArrowDown',
    'ArrowRight',
    'ArrowRight',
    'ArrowRight',
    'ArrowRight',
    'ArrowRight',
    'ArrowRight',
  ],
  'Leaves silence': [
    'ArrowDown',
    'ArrowRight',
    'ArrowRight',
    'ArrowRight',
    'ArrowRight',
    'ArrowRight',
    'ArrowRight',
    'ArrowDown',
  ],
};

const tree = (page: Page) => page.getByRole('tree', { name: 'Competency taxonomy' });
const item = (page: Page, name: string | RegExp) => tree(page).getByRole('treeitem', { name });

async function openDetail(page: Page, name: keyof typeof KEYS_FROM_PEOPLE) {
  await signIn(page);
  await page.getByRole('button', { name: 'Taxonomy', exact: true }).click();
  await item(page, /People$/).focus();
  for (const key of KEYS_FROM_PEOPLE[name]!) await page.keyboard.press(key);
  await expect(item(page, new RegExp(`${name}$`))).toBeFocused();
  await page.keyboard.press('Enter');
}

/** The detail on its own view (narrow): its h1, and the actions beside it. */
function ownView(page: Page, name: string) {
  const main = page.getByRole('main');
  return {
    title: main.getByRole('heading', { name, level: 1 }),
    actions: main.getByRole('group', { name: 'Actions' }),
  };
}

/** The top of each button, rounded: one value per row the buttons sit on. */
async function rowsOf(actions: Locator) {
  const tops = await actions.getByRole('button').evaluateAll(function readTops(buttons) {
    return buttons.map((button) => Math.round(button.getBoundingClientRect().top));
  });
  return new Set(tops).size;
}

test.describe('Actions on an item, on a phone (375 px)', () => {
  test.use({ viewport: PHONE });

  test('with two actions, both show in a row, as md Buttons', async ({ page }) => {
    await openDetail(page, 'Paraphrases');
    const { title, actions } = ownView(page, 'Paraphrases');
    await expect(title).toBeVisible();

    await expect(actions.getByRole('button')).toHaveText(['Edit description', 'Retire']);
    for (const button of await actions.getByRole('button').all()) {
      await expect(button).toHaveAttribute('data-pharos-size', 'md');
    }
    await expect(actions.getByRole('button', { name: 'Edit description' })).toHaveAttribute(
      'data-pharos-intent',
      'primary',
    );
    expect(await rowsOf(actions)).toBe(1);
    await expect(page.getByRole('button', { name: 'More actions' })).toHaveCount(0);
    // Why it has no «Move» nor «Delete».
    await expect(page.getByText('It cannot be moved or deleted')).toBeVisible();
  });

  test('with four, the principal one and «More actions», a menu with the destructive one last', async ({
    page,
  }) => {
    await openDetail(page, 'Leaves silence');
    const { title, actions } = ownView(page, 'Leaves silence');
    await expect(title).toBeFocused();

    await expect(actions.getByRole('button')).toHaveText(['Edit description', 'More actions']);
    expect(await rowsOf(actions)).toBe(1);
    const more = actions.getByRole('button', { name: 'More actions' });
    // A screen reader announces it as a button with a menu.
    await expect(more).toHaveAttribute('aria-haspopup', 'menu');
    await expect(more).toHaveAttribute('aria-expanded', 'false');
    await expect(more).toHaveAttribute('data-pharos-intent', 'secondary');
    await expect(more).toHaveAttribute('data-pharos-size', 'md');

    // The detail stays in view: the actions neither cover it nor push it out.
    const description = page.getByText('Leaves room for the other person to finish their thought');
    await expect(description).toBeInViewport();
    const actionsBox = (await actions.boundingBox())!;
    const descriptionBox = (await description.boundingBox())!;
    expect(actionsBox.y + actionsBox.height).toBeLessThanOrEqual(descriptionBox.y);

    // Focus order is the visual one: title, principal action, «More actions».
    await page.keyboard.press('Tab');
    await expect(actions.getByRole('button', { name: 'Edit description' })).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(more).toBeFocused();

    // Enter opens it on its first item; the arrows walk it.
    await page.keyboard.press('Enter');
    const menu = page.getByRole('menu');
    await expect(menu).toBeVisible();
    await expect(more).toHaveAttribute('aria-expanded', 'true');
    const items = menu.getByRole('menuitem');
    await expect(items).toHaveText(['Move', 'Retire', 'Delete']);
    await expect(items.first()).toBeFocused();
    await page.keyboard.press('ArrowDown');
    await expect(items.nth(1)).toBeFocused();
    await page.keyboard.press('ArrowDown');
    await expect(items.nth(2)).toBeFocused();

    // The destructive one is last, after a separator, in its variant.
    const destructive = menu.getByRole('menuitem', { name: 'Delete' });
    await expect(destructive).toHaveAttribute('data-pharos-variant', 'destructive');
    const lastTwo = menu.locator('[role="separator"] + [role="menuitem"]');
    await expect(lastTwo).toHaveText('Delete');

    // Escape closes it and gives focus back to the button.
    await page.keyboard.press('Escape');
    await expect(menu).toHaveCount(0);
    await expect(more).toBeFocused();

    // Space and ArrowDown open it too.
    await page.keyboard.press(' ');
    await expect(page.getByRole('menu')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(more).toBeFocused();
    await page.keyboard.press('ArrowDown');
    await expect(page.getByRole('menu')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(more).toBeFocused();
    await expect(title).toBeVisible();
  });

  test('every action in the menu does what it says', async ({ page }) => {
    await openDetail(page, 'Leaves silence');
    const { title, actions } = ownView(page, 'Leaves silence');
    const more = actions.getByRole('button', { name: 'More actions' });

    // Retire, chosen with the keyboard: marked retired, focus back on the
    // button, and the menu now offers to reinstate it.
    await more.focus();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('menuitem', { name: 'Move' })).toBeFocused();
    await page.keyboard.press('ArrowDown');
    await expect(page.getByRole('menuitem', { name: 'Retire' })).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('main').getByText('Retired', { exact: true })).toBeVisible();
    await expect(page.getByText('Leaves silence retired.')).toBeVisible();
    await expect(more).toBeFocused();
    await more.click();
    await expect(page.getByRole('menu').getByRole('menuitem')).toHaveText([
      'Move',
      'Reinstate',
      'Delete',
    ]);

    // Move is not part of the demo, and says so.
    await page.getByRole('menuitem', { name: 'Move' }).click();
    await expect(page.getByText('Moving an element is not part of this demo.')).toBeVisible();

    // Delete asks first; keeping it goes back to «More actions».
    await more.click();
    await page.getByRole('menuitem', { name: 'Delete' }).click();
    const confirmation = page.getByRole('alertdialog', { name: 'Delete Leaves silence?' });
    await expect(confirmation).toBeVisible();
    await confirmation.getByRole('button', { name: 'Keep Leaves silence' }).click();
    await expect(confirmation).toHaveCount(0);
    await expect(more).toBeFocused();
    await expect(title).toBeVisible();

    // Deleting it takes it out of the tree, with focus on its parent; Undo
    // puts it back.
    await more.click();
    await page.getByRole('menuitem', { name: 'Delete' }).click();
    await page
      .getByRole('alertdialog', { name: 'Delete Leaves silence?' })
      .getByRole('button', { name: 'Delete Leaves silence' })
      .click();
    await expect(item(page, /Active listening$/)).toBeFocused();
    await expect(item(page, /Leaves silence/)).toHaveCount(0);
    await page.getByRole('button', { name: 'Undo' }).click();
    await expect(item(page, /Leaves silence/)).toBeVisible();
  });

  test('passes axe with the menu open', async ({ page }) => {
    await openDetail(page, 'Leaves silence');
    await ownView(page, 'Leaves silence')
      .actions.getByRole('button', { name: 'More actions' })
      .click();
    await expect(page.getByRole('menu')).toBeVisible();
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze();
    expect(results.violations).toEqual([]);
  });

  test('with three and none destructive, the menu has no separator', async ({ page }) => {
    await openDetail(page, 'Feedback');
    const { actions } = ownView(page, 'Feedback');
    await expect(actions.getByRole('button')).toHaveText(['Edit description', 'More actions']);
    await actions.getByRole('button', { name: 'More actions' }).click();
    const menu = page.getByRole('menu');
    await expect(menu.getByRole('menuitem')).toHaveText(['Move', 'Retire']);
    await expect(menu.getByRole('separator')).toHaveCount(0);
  });

  test('with no actions, the head has the same shape, with only its title', async ({ page }) => {
    await openDetail(page, 'People');
    const { title, actions } = ownView(page, 'People');
    await expect(title).toBeVisible();
    await expect(actions).toHaveCount(0);
    await expect(page.getByRole('main').getByRole('button')).toHaveText(['Back to the taxonomy']);
    await expect(page.getByText('It comes from the organisation’s template')).toBeVisible();
  });

  test('the actions come out in the shape of their width from the first render', async ({
    page,
  }) => {
    // Every shape the actions ever took in the document, from the start.
    await page.addInitScript(function recordShapes() {
      const shapes: string[] = [];
      (window as unknown as { actionShapes: string[] }).actionShapes = shapes;
      new MutationObserver(function record(mutations) {
        for (const mutation of mutations) {
          const nodes =
            mutation.type === 'attributes' ? [mutation.target] : [...mutation.addedNodes];
          for (const node of nodes) {
            if (!(node instanceof Element)) continue;
            const found = node.matches('[data-item-actions]')
              ? [node]
              : [...node.querySelectorAll('[data-item-actions]')];
            for (const actions of found) shapes.push(actions.getAttribute('data-item-actions')!);
          }
        }
      }).observe(document, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['data-item-actions'],
      });
    });
    await openDetail(page, 'Leaves silence');
    await expect(ownView(page, 'Leaves silence').actions).toBeVisible();
    const shapes = await page.evaluate(function readShapes() {
      return (window as unknown as { actionShapes: string[] }).actionShapes;
    });
    expect(new Set(shapes)).toEqual(new Set(['grouped']));
  });
});

test.describe('Actions on an item, on a desktop', () => {
  test.use({ viewport: DESKTOP });

  test('every action shows, in a row that wraps inside the SidePanel', async ({ page }) => {
    await openDetail(page, 'Leaves silence');
    const panel = page.getByRole('complementary', { name: 'Leaves silence' });
    const actions = panel.getByRole('group', { name: 'Actions' });
    // Wait for the panel's opening motion to end before measuring.
    await expect(panel).toBeVisible();
    await page.evaluate(function settle() {
      return Promise.all(document.getAnimations().map((animation) => animation.finished));
    });

    await expect(actions.getByRole('button')).toHaveText([
      'Edit description',
      'Move',
      'Retire',
      'Delete',
    ]);
    await expect(actions.getByRole('button', { name: 'Delete' })).toHaveAttribute(
      'data-pharos-intent',
      'destructive',
    );
    await expect(page.getByRole('button', { name: 'More actions' })).toHaveCount(0);

    // None of them sticks out of the panel: the row wraps instead.
    const panelBox = (await panel.boundingBox())!;
    for (const button of await actions.getByRole('button').all()) {
      const box = (await button.boundingBox())!;
      expect(box.x).toBeGreaterThanOrEqual(panelBox.x);
      expect(box.x + box.width).toBeLessThanOrEqual(panelBox.x + panelBox.width);
    }

    // Deleting from the row asks first; keeping it gives focus back to Delete.
    await actions.getByRole('button', { name: 'Delete' }).click();
    await page
      .getByRole('alertdialog', { name: 'Delete Leaves silence?' })
      .getByRole('button', { name: 'Keep Leaves silence' })
      .click();
    await expect(actions.getByRole('button', { name: 'Delete' })).toBeFocused();
  });
});

test.describe('Actions on an item, across the compact breakpoint', () => {
  test('the detail changes shape on either side of it, keeping the element and its actions', async ({
    page,
  }) => {
    await page.setViewportSize(PHONE);
    await openDetail(page, 'Leaves silence');
    const { title, actions } = ownView(page, 'Leaves silence');
    await expect(actions.getByRole('button')).toHaveText(['Edit description', 'More actions']);

    await page.setViewportSize(TABLET);
    await expect(actions).toHaveAttribute('data-item-actions', 'row');
    await expect(title).toBeVisible();
    await expect(actions.getByRole('button')).toHaveText([
      'Edit description',
      'Move',
      'Retire',
      'Delete',
    ]);

    await page.setViewportSize(PHONE);
    await expect(actions).toHaveAttribute('data-item-actions', 'grouped');
    await expect(title).toBeVisible();
    await expect(actions.getByRole('button')).toHaveText(['Edit description', 'More actions']);

    // Wide enough for the SidePanel, and back.
    await page.setViewportSize(DESKTOP);
    const panelActions = page
      .getByRole('complementary', { name: 'Leaves silence' })
      .getByRole('group', { name: 'Actions' });
    await expect(panelActions.getByRole('button')).toHaveText([
      'Edit description',
      'Move',
      'Retire',
      'Delete',
    ]);
    await page.setViewportSize(PHONE);
    await expect(title).toBeVisible();
    await expect(actions.getByRole('button')).toHaveText(['Edit description', 'More actions']);
  });
});

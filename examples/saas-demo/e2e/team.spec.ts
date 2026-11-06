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

  test('filters by role from a narrow pill whose options stay on one line', async ({ page }) => {
    const trigger = page.getByRole('combobox', { name: 'Role' });
    await expect(trigger).toHaveText('Any role');
    await trigger.click();
    const listbox = page.getByRole('listbox');
    await expect(listbox).toBeVisible();

    // The panel around the list (the popup, which carries data-side), at least
    // as wide as the trigger that opened it. Layout widths (offsetWidth): the
    // panel opens with a scale transition that bounding boxes would include.
    const triggerWidth = await trigger.evaluate(function measureTrigger(el) {
      return (el as HTMLElement).offsetWidth;
    });
    const panelWidth = await listbox.evaluate(function measurePanel(el) {
      return ((el.closest('[data-side]') ?? el) as HTMLElement).offsetWidth;
    });
    expect(panelWidth).toBeGreaterThanOrEqual(triggerWidth);
    for (const name of ['Any role', 'Admin', 'Editor', 'Viewer']) {
      const option = page.getByRole('option', { name });
      const lines = await option.evaluate(function countLines(el) {
        const text = el.firstElementChild ?? el;
        const lineHeight = parseFloat(getComputedStyle(el).lineHeight);
        return Math.round(text.getBoundingClientRect().height / lineHeight);
      });
      expect(lines, `«${name}» should fit on one line`).toBe(1);
    }

    await page.getByRole('option', { name: 'Editor' }).click();
    await expect(trigger).toHaveText('Editor');
    await expect(page.getByText('Alan Turing', { exact: true })).toBeVisible();
    await expect(page.getByText('Ada Lovelace', { exact: true })).toHaveCount(0);
  });

  test('lists team members', async ({ page }) => {
    await expect(page.getByText('Ada Lovelace')).toBeVisible();
    await expect(page.getByText('Grace Hopper')).toBeVisible();
  });

  test('removes a member through the row action menu', async ({ page }) => {
    await expect(page.getByText('Alan Turing', { exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Actions for Alan Turing' }).click();
    await page.getByRole('menuitem', { name: 'Remove from team' }).click();
    await expect(
      page.getByRole('dialog', { name: 'Alan Turing removed from the team.' }),
    ).toBeVisible();
    await expect(page.getByText('Alan Turing', { exact: true })).toHaveCount(0);
  });

  test('undoes the removal from the toast that confirms it', async ({ page }) => {
    await page.getByRole('button', { name: 'Actions for Alan Turing' }).click();
    await page.getByRole('menuitem', { name: 'Remove from team' }).click();
    const toast = page.getByRole('dialog', { name: 'Alan Turing removed from the team.' });

    await toast.getByRole('button', { name: 'Undo' }).click();

    await expect(page.getByText('Alan Turing', { exact: true })).toBeVisible();
    await expect(toast).toHaveCount(0);
  });

  test('switches the member layout between list and grid', async ({ page }) => {
    const layout = page.getByRole('group', { name: 'Layout' });
    const list = layout.getByRole('button', { name: 'List' });
    const grid = layout.getByRole('button', { name: 'Grid' });
    const ada = page.getByRole('listitem').filter({ hasText: 'Ada Lovelace' });
    const grace = page.getByRole('listitem').filter({ hasText: 'Grace Hopper' });
    await expect(list).toHaveAttribute('aria-pressed', 'true');

    /** Whether the two rows sit side by side rather than one under the other. */
    async function sideBySide(): Promise<boolean> {
      const [a, g] = [await ada.boundingBox(), await grace.boundingBox()];
      return a !== null && g !== null && Math.abs(a.y - g.y) < 1;
    }

    expect(await sideBySide()).toBe(false);
    await grid.click();
    await expect(grid).toHaveAttribute('aria-pressed', 'true');
    await expect(list).toHaveAttribute('aria-pressed', 'false');
    await expect.poll(sideBySide).toBe(true);

    // Pressing the pressed item again keeps it: the view always has an answer.
    await grid.click();
    await expect(grid).toHaveAttribute('aria-pressed', 'true');

    // Keyboard: arrow to List, then Enter presses it.
    await grid.press('ArrowLeft');
    await expect(list).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(list).toHaveAttribute('aria-pressed', 'true');
    await expect.poll(sideBySide).toBe(false);
  });

  test('paints the layout switch on the warm paper rail', async ({ page }) => {
    const layout = page.getByRole('group', { name: 'Layout' });
    const paper200 = await page.evaluate(function resolvePaper200() {
      const probe = document.createElement('span');
      probe.style.backgroundColor = 'var(--pharos-color-paper-200)';
      document.body.append(probe);
      const color = getComputedStyle(probe).backgroundColor;
      probe.remove();
      return color;
    });
    expect(paper200).not.toBe('rgba(0, 0, 0, 0)');
    await expect(layout).toHaveCSS('background-color', paper200);
  });
});

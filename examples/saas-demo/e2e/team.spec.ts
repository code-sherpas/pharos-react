import { test, expect } from '@playwright/test';
import { signIn } from './helpers';

// The per-row DropdownMenu (kebab IconButton) inside a list, plus a
// destructive action that mutates the list once an AlertDialog confirms it.
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
    await page
      .getByRole('alertdialog', { name: 'Remove Alan Turing from the team?' })
      .getByRole('button', { name: 'Remove' })
      .click();
    await expect(
      page.getByRole('dialog', { name: 'Alan Turing removed from the team.' }),
    ).toBeVisible();
    await expect(page.getByText('Alan Turing', { exact: true })).toHaveCount(0);
  });

  test('undoes the removal from the toast that confirms it', async ({ page }) => {
    await page.getByRole('button', { name: 'Actions for Alan Turing' }).click();
    await page.getByRole('menuitem', { name: 'Remove from team' }).click();
    await page.getByRole('alertdialog').getByRole('button', { name: 'Remove' }).click();
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

  test.describe('confirming a removal', () => {
    test.beforeEach(async ({ page }) => {
      await page.getByRole('button', { name: 'Actions for Alan Turing' }).click();
      await page.getByRole('menuitem', { name: 'Remove from team' }).click();
    });

    test('asks first, as an alert named and described for screen readers', async ({ page }) => {
      const confirm = page.getByRole('alertdialog', { name: 'Remove Alan Turing from the team?' });
      await expect(confirm).toBeVisible();
      await expect(confirm).toHaveAccessibleDescription(
        'They lose access to every project in Nimbus straight away.',
      );
      // Nothing is removed until it is confirmed.
      await expect(page.getByText('Alan Turing', { exact: true })).toBeVisible();
    });

    test('starts on Cancel, so Enter backs out instead of removing', async ({ page }) => {
      const confirm = page.getByRole('alertdialog');
      await expect(confirm.getByRole('button', { name: 'Cancel' })).toBeFocused();

      await page.keyboard.press('Enter');

      await expect(confirm).toHaveCount(0);
      await expect(page.getByText('Alan Turing', { exact: true })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Actions for Alan Turing' })).toBeFocused();
    });

    test('ignores a click outside', async ({ page }) => {
      const confirm = page.getByRole('alertdialog');
      await expect(confirm).toBeVisible();

      // The backdrop covers the page; click well away from the centered panel.
      await page.mouse.click(5, 5);

      await expect(confirm).toBeVisible();
      await expect(page.getByText('Alan Turing', { exact: true })).toBeVisible();
    });

    test('backs out on Escape and returns focus to the row menu', async ({ page }) => {
      const confirm = page.getByRole('alertdialog');
      await expect(confirm.getByRole('button', { name: 'Cancel' })).toBeFocused();

      await page.keyboard.press('Escape');

      await expect(confirm).toHaveCount(0);
      await expect(page.getByText('Alan Turing', { exact: true })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Actions for Alan Turing' })).toBeFocused();
    });

    test('backs out on Cancel and returns focus to the row menu', async ({ page }) => {
      const confirm = page.getByRole('alertdialog');
      await confirm.getByRole('button', { name: 'Cancel' }).click();

      await expect(confirm).toHaveCount(0);
      await expect(page.getByText('Alan Turing', { exact: true })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Actions for Alan Turing' })).toBeFocused();
    });

    test('removes on confirm and moves focus to the page heading', async ({ page }) => {
      const confirm = page.getByRole('alertdialog');
      await confirm.getByRole('button', { name: 'Remove' }).click();

      await expect(confirm).toHaveCount(0);
      await expect(page.getByText('Alan Turing', { exact: true })).toHaveCount(0);
      // The row and its menu are gone: focus lands somewhere meaningful.
      await expect(page.getByRole('heading', { name: 'Team', exact: true })).toBeFocused();
    });

    test('stays open and busy while the removal is in progress, then closes', async ({ page }) => {
      const confirm = page.getByRole('alertdialog', { name: 'Remove Alan Turing from the team?' });
      const action = confirm.getByRole('button', { name: 'Remove' });
      const cancel = confirm.getByRole('button', { name: 'Cancel' });

      await action.click();

      // In progress: busy, the progress said in the status region, Action
      // aria-disabled yet still focused, and its Spinner hidden from the
      // accessibility tree (only the consumer's message is announced).
      await expect(confirm).toHaveAttribute('aria-busy', 'true');
      await expect(confirm.getByRole('status')).toHaveText('Removing Alan Turing…');
      await expect(action).toHaveAttribute('aria-disabled', 'true');
      await expect(action).toBeFocused();
      await expect(action).toHaveAccessibleName('Remove');
      await expect(action.locator('[role="status"]')).toHaveAttribute('aria-hidden', 'true');
      await expect(cancel).toHaveAttribute('aria-disabled', 'true');

      // Nothing closes it meanwhile: Escape, Cancel, a click outside.
      // Cancel by keyboard: aria-disabled keeps it focusable, and Playwright
      // refuses to click an aria-disabled element that a person can still press.
      await page.keyboard.press('Escape');
      await page.keyboard.press('Shift+Tab');
      await expect(cancel).toBeFocused();
      await page.keyboard.press('Enter');
      await page.mouse.click(5, 5);
      await expect(confirm).toBeVisible();
      await expect(page.getByText('Alan Turing', { exact: true })).toBeVisible();

      // When it answers, it closes; the row is gone, so focus goes to the heading.
      await expect(confirm).toHaveCount(0);
      await expect(page.getByText('Alan Turing', { exact: true })).toHaveCount(0);
      await expect(page.getByRole('heading', { name: 'Team', exact: true })).toBeFocused();
    });
  });

  test('shows the error when a removal fails, and Retry removes with the dialog open', async ({
    page,
  }) => {
    // Katherine Johnson's first removal fails, as a dropped connection would.
    await page.getByRole('button', { name: 'Actions for Katherine Johnson' }).click();
    await page.getByRole('menuitem', { name: 'Remove from team' }).click();
    const confirm = page.getByRole('alertdialog', {
      name: 'Remove Katherine Johnson from the team?',
    });

    await confirm.getByRole('button', { name: 'Remove' }).click();

    await expect(confirm.getByRole('alert')).toHaveText(
      'Katherine Johnson could not be removed. Check your connection and retry.',
    );
    await expect(confirm).not.toHaveAttribute('aria-busy', 'true');
    await expect(page.getByText('Katherine Johnson', { exact: true })).toBeVisible();
    const retry = confirm.getByRole('button', { name: 'Retry' });
    await expect(retry).toBeFocused();
    await expect(retry).not.toHaveAttribute('aria-disabled', 'true');

    await retry.click();

    await expect(confirm).toHaveAttribute('aria-busy', 'true');
    await expect(confirm.getByRole('alert')).toHaveText('');
    await expect(confirm).toHaveCount(0);
    await expect(page.getByText('Katherine Johnson', { exact: true })).toHaveCount(0);
    await expect(
      page.getByRole('dialog', { name: 'Katherine Johnson removed from the team.' }),
    ).toBeVisible();
  });
});

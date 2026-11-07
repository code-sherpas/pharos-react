import { test, expect, type Page } from '@playwright/test';
import { signIn } from './helpers';

// The SidePanel on the Report page: a form that adds an action to the
// coaching plan. From the panel breakpoint (64rem) up it sits beside the
// report and narrows it, without trapping focus; below it, it opens as the
// modal Sheet. Covers the keyboard contract (focus in, Escape, focus back),
// the report staying usable, a Select inside the panel closing before it,
// the switch between forms when the window crosses the breakpoint, and
// reduced motion.
const WIDE = { width: 1280, height: 800 };
const NARROW = { width: 800, height: 900 };

async function openReport(page: Page) {
  await signIn(page);
  await page.getByRole('button', { name: 'Report', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Assessment report' })).toBeVisible();
}

const trigger = (page: Page) => page.getByRole('button', { name: 'Add action' });
const inlinePanel = (page: Page) => page.getByRole('complementary', { name: 'New action' });
const modalPanel = (page: Page) => page.getByRole('dialog', { name: 'New action' });

test.describe('SidePanel beside the report (wide screen)', () => {
  test.use({ viewport: WIDE });

  test.beforeEach(async ({ page }) => {
    await openReport(page);
  });

  test('opens beside the report, narrows it, and takes focus', async ({ page }) => {
    const report = page.locator('.report-body');
    const widthBefore = (await report.boundingBox())!.width;
    await expect(trigger(page)).toHaveAttribute('aria-expanded', 'false');

    await trigger(page).click();

    const panel = inlinePanel(page);
    await expect(panel).toBeVisible();
    await expect(panel).toHaveAttribute('data-pharos-mode', 'inline');
    await expect(trigger(page)).toHaveAttribute('aria-expanded', 'true');
    await expect(trigger(page)).toHaveAttribute('aria-controls', (await panel.getAttribute('id'))!);
    await expect(page.getByLabel('Action', { exact: true })).toBeFocused();
    await expect(modalPanel(page)).toHaveCount(0);
    // It grows to the panel width (24rem) and takes that room in the row: the
    // report is narrower, side by side with it.
    await expect.poll(async () => (await panel.boundingBox())!.width).toBe(384);
    expect((await report.boundingBox())!.width).toBeLessThan(widthBefore);
    const reportBox = (await report.boundingBox())!;
    const panelBox = (await panel.boundingBox())!;
    expect(panelBox.x).toBeGreaterThanOrEqual(reportBox.x + reportBox.width);
  });

  test('leaves the report usable: a click or tabbing out does not close it', async ({ page }) => {
    await trigger(page).click();
    await page.getByLabel('Action', { exact: true }).fill('Write the onboarding guide');

    const reviewed = page.getByRole('checkbox', { name: 'Reviewed' });
    await reviewed.click();
    await expect(reviewed).toBeChecked();
    await expect(inlinePanel(page)).toBeVisible();

    // Back in the panel, Tab past its last control: focus leaves, the panel stays.
    await page.getByRole('button', { name: 'Save action' }).focus();
    await page.keyboard.press('Tab');
    await expect(inlinePanel(page)).toBeVisible();
    const focusInside = await inlinePanel(page).evaluate(function holdsFocus(panel) {
      return panel.contains(document.activeElement);
    });
    expect(focusInside).toBe(false);
    await expect(page.getByLabel('Action', { exact: true })).toHaveValue(
      'Write the onboarding guide',
    );
  });

  test('Escape closes a Select inside it first, then the panel, and focus returns', async ({
    page,
  }) => {
    await trigger(page).click();
    const priority = page.getByRole('combobox', { name: 'Priority' });
    await priority.click();
    await expect(page.getByRole('listbox')).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(page.getByRole('listbox')).toHaveCount(0);
    await expect(inlinePanel(page)).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(inlinePanel(page)).toHaveCount(0);
    await expect(trigger(page)).toBeFocused();
    await expect(trigger(page)).toHaveAttribute('aria-expanded', 'false');
  });

  test('Cancel closes it and returns focus to the trigger', async ({ page }) => {
    await trigger(page).click();
    await page.getByRole('button', { name: 'Cancel' }).click();
    await expect(inlinePanel(page)).toHaveCount(0);
    await expect(trigger(page)).toBeFocused();
  });

  test('saving the form adds the action to the plan beside it', async ({ page }) => {
    await trigger(page).click();
    await page.getByLabel('Action', { exact: true }).fill('Rotate the on-call schedule');
    await page.getByRole('combobox', { name: 'Priority' }).click();
    await page.getByRole('option', { name: 'High' }).click();
    await page.getByRole('button', { name: 'Save action' }).click();

    await expect(inlinePanel(page)).toHaveCount(0);
    await expect(page.getByRole('list', { name: 'Coaching plan' })).toContainText(
      'Rotate the on-call schedule · High',
    );
  });

  test('with reduced motion, it neither slides nor grows', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await trigger(page).click();
    await expect(inlinePanel(page)).toBeVisible();
    const duration = await inlinePanel(page).evaluate(function readTransition(panel) {
      return getComputedStyle(panel).transitionDuration;
    });
    expect(duration).toBe('0s');
  });
});

test.describe('SidePanel as a modal Sheet (narrow screen)', () => {
  test.use({ viewport: NARROW });

  test.beforeEach(async ({ page }) => {
    await openReport(page);
  });

  test('opens as a modal dialog with focus inside, and Escape returns focus', async ({ page }) => {
    await trigger(page).click();

    const dialog = modalPanel(page);
    await expect(dialog).toBeVisible();
    await expect(dialog).toHaveAttribute('data-pharos-mode', 'modal');
    await expect(inlinePanel(page)).toHaveCount(0);
    await expect(page.getByLabel('Action', { exact: true })).toBeFocused();

    await page.keyboard.press('Escape');
    await expect(dialog).toHaveCount(0);
    await expect(trigger(page)).toBeFocused();
  });

  test('Escape closes a Select inside it first, then the panel', async ({ page }) => {
    await trigger(page).click();
    await page.getByRole('combobox', { name: 'Priority' }).click();
    await expect(page.getByRole('listbox')).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(page.getByRole('listbox')).toHaveCount(0);
    await expect(modalPanel(page)).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(modalPanel(page)).toHaveCount(0);
    await expect(trigger(page)).toBeFocused();
  });

  test('with reduced motion, the Sheet does not slide', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await trigger(page).click();
    await expect(modalPanel(page)).toBeVisible();
    const duration = await modalPanel(page).evaluate(function readTransition(panel) {
      return getComputedStyle(panel).transitionDuration;
    });
    expect(duration).toBe('0s');
  });
});

test.describe('SidePanel crossing the breakpoint while open', () => {
  test.use({ viewport: WIDE });

  test('stays open, changes form, and focus follows it', async ({ page }) => {
    await openReport(page);
    await trigger(page).click();
    await page.getByLabel('Action', { exact: true }).fill('Draft kept by the page');

    await page.setViewportSize(NARROW);
    await expect(modalPanel(page)).toBeVisible();
    await expect(inlinePanel(page)).toHaveCount(0);
    await expect
      .poll(() =>
        modalPanel(page).evaluate(function holdsFocus(panel) {
          return panel.contains(document.activeElement);
        }),
      )
      .toBe(true);
    await expect(page.getByLabel('Action', { exact: true })).toHaveValue('Draft kept by the page');

    await page.setViewportSize(WIDE);
    await expect(inlinePanel(page)).toBeVisible();
    await expect(modalPanel(page)).toHaveCount(0);
    await expect
      .poll(() =>
        inlinePanel(page).evaluate(function holdsFocus(panel) {
          return panel.contains(document.activeElement);
        }),
      )
      .toBe(true);
  });
});

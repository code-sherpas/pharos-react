import { test, expect, type Page } from '@playwright/test';
import { layerAtTheCorner, layerOf, signIn } from './helpers';

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
    const report = page.getByRole('main');
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
    // Edge to edge in the shell: from the top bar down to the bottom of the
    // viewport, flush with its right edge, and a landmark beside <main>, not in it.
    const topBar = (await page.getByRole('banner').boundingBox())!;
    expect(panelBox.y).toBeCloseTo(topBar.y + topBar.height, 0);
    expect(panelBox.y + panelBox.height).toBeCloseTo(WIDE.height, 0);
    expect(panelBox.x + panelBox.width).toBeCloseTo(WIDE.width, 0);
    await expect(page.getByRole('main').getByRole('complementary')).toHaveCount(0);
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
    await expect(trigger(page)).toBeFocused();
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

  // The modal form opens as a Sheet does when the window narrows: it slides
  // in from its edge, rather than appearing already in place.
  test('slides in as the modal Sheet when the window narrows', async ({ page }) => {
    await openReport(page);
    await trigger(page).click();
    await expect(inlinePanel(page)).toBeVisible();

    await page.setViewportSize(NARROW);
    const firstFrame = await modalPanel(page).evaluate(function readTransform(panel) {
      return getComputedStyle(panel).transform;
    });
    expect(firstFrame).not.toBe('none');
    await expect
      .poll(() =>
        modalPanel(page).evaluate(function readTransform(panel) {
          return getComputedStyle(panel).transform;
        }),
      )
      .toBe('none');
  });
});

// A modal opened from the report is a modal of its own, not one nested in the
// SidePanel: it dims the whole page with its backdrop, wherever the panel is.
// What paints at the top-left corner (over the top bar) is a translucent
// layer outside the app, on the dialog's modal layer — not the page itself.
const scoring = (page: Page) => page.getByRole('dialog', { name: 'How it was scored' });

async function expectPageDimmedBy(page: Page, dialog: ReturnType<typeof scoring>) {
  await expect(dialog).toBeVisible();
  await expect
    .poll(function readCorner() {
      return page.evaluate(function isCornerDimmed() {
        const corner = document.elementFromPoint(1, 1);
        if (corner === null || document.getElementById('root')!.contains(corner)) return false;
        const style = getComputedStyle(corner);
        // Faded in, and painting a colour over the page.
        return style.opacity === '1' && style.backgroundColor !== 'rgba(0, 0, 0, 0)';
      });
    })
    .toBe(true);
  expect(await layerAtTheCorner(page)).toBe(await layerOf(dialog));
}

async function openScoring(page: Page) {
  await page.getByRole('button', { name: 'How it was scored' }).click();
  await expectPageDimmedBy(page, scoring(page));
  await page.getByRole('button', { name: 'Close' }).click();
  await expect(scoring(page)).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'How it was scored' })).toBeFocused();
}

test.describe('A dialog opened from the report dims the page', () => {
  test('on a wide screen, with the panel closed and open', async ({ page }) => {
    await page.setViewportSize(WIDE);
    await openReport(page);
    await openScoring(page);

    await trigger(page).click();
    await expect(inlinePanel(page)).toBeVisible();
    await openScoring(page);
    await expect(inlinePanel(page)).toBeVisible();
  });

  test('on a narrow screen', async ({ page }) => {
    await page.setViewportSize(NARROW);
    await openReport(page);
    await openScoring(page);
  });
});

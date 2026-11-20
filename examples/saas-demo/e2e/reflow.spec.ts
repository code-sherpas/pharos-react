import { test, expect, type Page } from '@playwright/test';
import { signIn } from './helpers';

// WCAG 2.2 1.4.10 Reflow: on a phone no page of the app is wider than the
// screen, so nothing needs a sideways scroll to reach. Checked at 320px, the
// width the criterion names, and at 375px, a common phone.
// What overflowed: the top bar, one unwrapped row 761px wide at 375; and, at
// 320, Team's heading row (title, role filter, view toggle) and its member rows,
// whose address could not shrink and pushed the row's menu off screen.

const PHONES = [
  { width: 320, height: 640 },
  { width: 375, height: 812 },
] as const;

const PAGES = [
  { nav: 'Dashboard', heading: 'Dashboard' },
  { nav: 'Team', heading: 'Team' },
  { nav: 'Report', heading: 'Assessment report' },
  { nav: 'Taxonomy', heading: 'Competency taxonomy' },
  { nav: 'Settings', heading: 'Settings' },
] as const;

function horizontalOverflow(page: Page): Promise<number> {
  return page.evaluate(function measureOverflow() {
    const root = document.documentElement;
    return root.scrollWidth - root.clientWidth;
  });
}

async function expectInsideTheScreen(page: Page, name: string, screenWidth: number) {
  const box = await page.getByRole('button', { name }).boundingBox();
  expect(box, `«${name}» should be rendered`).not.toBeNull();
  expect(box!.x, `«${name}» starts on screen`).toBeGreaterThanOrEqual(0);
  expect(box!.x + box!.width, `«${name}» ends on screen`).toBeLessThanOrEqual(screenWidth);
}

for (const phone of PHONES) {
  test.describe(`On a ${phone.width}px phone`, () => {
    test.use({ viewport: phone });

    test('the sign-in page fits the screen', async ({ page }) => {
      await page.goto('/');
      await expect(page.getByLabel('Email')).toBeVisible();
      expect(await horizontalOverflow(page)).toBe(0);
    });

    for (const { nav, heading } of PAGES) {
      test(`${nav} fits the screen, top bar included`, async ({ page }) => {
        await signIn(page);
        await page
          .getByRole('navigation', { name: 'Primary' })
          .getByRole('button', { name: nav })
          .click();
        await expect(page.getByRole('heading', { name: heading, level: 1 })).toBeVisible();

        expect(await horizontalOverflow(page)).toBe(0);
        // What used to be pushed off to the right: the last section and the account menu.
        await expectInsideTheScreen(page, 'Settings', phone.width);
        await expectInsideTheScreen(page, 'Account menu', phone.width);
      });
    }

    test('every member row of Team keeps its menu on screen', async ({ page }) => {
      await signIn(page);
      await page
        .getByRole('navigation', { name: 'Primary' })
        .getByRole('button', { name: 'Team' })
        .click();
      const menus = page.getByRole('button', { name: /^Actions for / });
      await expect(menus.first()).toBeVisible();
      const names = await menus.evaluateAll(function readNames(buttons) {
        return buttons.map(function nameOf(button) {
          return button.getAttribute('aria-label') ?? '';
        });
      });
      expect(names.length).toBeGreaterThan(0);
      for (const name of names) await expectInsideTheScreen(page, name, phone.width);
    });
  });
}

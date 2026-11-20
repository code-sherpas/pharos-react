import { test, expect, type Page } from '@playwright/test';
import { signIn } from './helpers';

// WCAG 2.2 1.4.10 Reflow: on a phone no page of the app is wider than the
// screen, so nothing — the top bar included — needs a sideways scroll to reach.
// The top bar used to be one unwrapped row of brand, navigation and actions,
// 761 px wide at 375.
test.use({ viewport: { width: 375, height: 812 } });

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

async function expectInsideTheScreen(page: Page, name: string) {
  const box = await page.getByRole('button', { name }).boundingBox();
  expect(box, `«${name}» should be rendered`).not.toBeNull();
  expect(box!.x, `«${name}» starts on screen`).toBeGreaterThanOrEqual(0);
  expect(box!.x + box!.width, `«${name}» ends on screen`).toBeLessThanOrEqual(375);
}

test('the sign-in page fits a phone screen', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByLabel('Email')).toBeVisible();
  expect(await horizontalOverflow(page)).toBe(0);
});

for (const { nav, heading } of PAGES) {
  test(`${nav} fits a phone screen, top bar included`, async ({ page }) => {
    await signIn(page);
    await page
      .getByRole('navigation', { name: 'Primary' })
      .getByRole('button', { name: nav })
      .click();
    await expect(page.getByRole('heading', { name: heading, level: 1 })).toBeVisible();

    expect(await horizontalOverflow(page)).toBe(0);
    // What used to be pushed off to the right: the last section and the account menu.
    await expectInsideTheScreen(page, 'Settings');
    await expectInsideTheScreen(page, 'Account menu');
  });
}

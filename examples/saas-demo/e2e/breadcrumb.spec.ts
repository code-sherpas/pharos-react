import AxeBuilder from '@axe-core/playwright';
import { test, expect, type Page } from '@playwright/test';
import { signIn } from './helpers';

// The inner screens of Team — a member's page and a member's projects — say
// where the person is with a Pharos Breadcrumb and take them back up. Checked
// as an admin, who may open member pages, and as a viewer, who may not; with
// the keyboard; and on a 320px phone with a name long enough to wrap.

async function openTeam(page: Page) {
  await page
    .getByRole('navigation', { name: 'Primary' })
    .getByRole('button', { name: 'Team' })
    .click();
  await expect(page.getByRole('heading', { name: 'Team', level: 1 })).toBeVisible();
}

function breadcrumb(page: Page) {
  return page.getByRole('navigation', { name: 'Breadcrumb' });
}

test.describe('Breadcrumb on the inner screens of Team', () => {
  test('an admin goes down to a member and their projects, and back up by the breadcrumb', async ({
    page,
  }) => {
    await signIn(page);
    await openTeam(page);
    await expect(breadcrumb(page)).toHaveCount(0); // a page the main navigation opens has none

    await page.getByRole('link', { name: 'Katherine Johnson' }).click();
    const memberHeading = page.getByRole('heading', { name: 'Katherine Johnson', level: 1 });
    await expect(memberHeading).toBeFocused();
    // Read as a screen reader reads it: a named navigation, a list of levels,
    // no separator, and the current screen as text, not a link.
    await expect(breadcrumb(page)).toMatchAriaSnapshot(`
      - navigation "Breadcrumb":
        - list:
          - listitem:
            - link "Team"
          - listitem: Katherine Johnson
    `);
    await expect(breadcrumb(page).getByText('Katherine Johnson')).toHaveAttribute(
      'aria-current',
      'page',
    );

    await page.getByRole('link', { name: 'Projects' }).click();
    await expect(
      page.getByRole('heading', { name: 'Projects of Katherine Johnson', level: 1 }),
    ).toBeFocused();
    await expect(breadcrumb(page)).toMatchAriaSnapshot(`
      - navigation "Breadcrumb":
        - list:
          - listitem:
            - link "Team"
          - listitem:
            - link "Katherine Johnson"
          - listitem: Projects
    `);

    await breadcrumb(page).getByRole('link', { name: 'Katherine Johnson' }).click();
    await expect(memberHeading).toBeFocused();

    await breadcrumb(page).getByRole('link', { name: 'Team' }).click();
    await expect(page.getByRole('heading', { name: 'Team', level: 1 })).toBeFocused();
  });

  test('goes up a level with the keyboard alone', async ({ page }) => {
    await signIn(page);
    await openTeam(page);
    await page.getByRole('link', { name: 'Alan Turing' }).focus();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('heading', { name: 'Alan Turing', level: 1 })).toBeFocused();

    // From the heading, back to the breadcrumb above it; its current screen
    // is not a stop, so the only one is the link up to Team.
    await page.keyboard.press('Shift+Tab');
    const up = breadcrumb(page).getByRole('link', { name: 'Team' });
    await expect(up).toBeFocused();
    // Pharos's one focus ring: the same as a focused Pharos Button's.
    const linkRing = await up.evaluate(function readRing(element) {
      return getComputedStyle(element).boxShadow;
    });
    const primary = page.getByRole('button', { name: 'New project' });
    await primary.focus();
    await page.keyboard.press('Shift+Tab');
    await page.keyboard.press('Tab');
    await expect(primary).toBeFocused();
    expect(linkRing, 'the focused link shows a focus ring').toContain('4px');
    // The Button's ring fades in: wait for it to settle before comparing.
    await expect
      .poll(function readButtonRing() {
        return primary.evaluate(function readRing(element) {
          return getComputedStyle(element).boxShadow;
        });
      })
      .toBe(linkRing);
    await up.focus();

    await page.keyboard.press('Enter');
    await expect(page.getByRole('heading', { name: 'Team', level: 1 })).toBeFocused();
  });

  test('a viewer sees the member level of their own projects as text, not a link to a refusal', async ({
    page,
  }) => {
    await signIn(page, 'grace@nimbus.io');
    await openTeam(page);
    // Member pages are for admins and editors: no name in the list is a link.
    await expect(page.getByRole('link', { name: 'Grace Hopper' })).toHaveCount(0);

    await page.getByRole('button', { name: 'Account menu' }).click();
    await page.getByRole('menuitem', { name: 'Your projects' }).click();
    await expect(
      page.getByRole('heading', { name: 'Projects of Grace Hopper', level: 1 }),
    ).toBeFocused();

    await expect(breadcrumb(page)).toMatchAriaSnapshot(`
      - navigation "Breadcrumb":
        - list:
          - listitem:
            - link "Team"
          - listitem: Grace Hopper
          - listitem: Projects
    `);
    const memberLevel = breadcrumb(page).getByText('Grace Hopper');
    await expect(memberLevel).not.toHaveAttribute('aria-current');
    await expect(breadcrumb(page).getByText('Projects')).toHaveAttribute('aria-current', 'page');
    // Told apart from the current screen by more than colour.
    const weights = await breadcrumb(page).evaluate(function readWeights(nav) {
      const weightOf = (selector: string) =>
        getComputedStyle(nav.querySelector(selector)!).fontWeight;
      return {
        text: weightOf('[data-pharos-slot="breadcrumb-text"]'),
        page: weightOf('[data-pharos-slot="breadcrumb-page"]'),
      };
    });
    expect(Number(weights.page)).toBeGreaterThan(Number(weights.text));
  });

  test('passes axe on both inner screens, with a level that cannot be opened', async ({ page }) => {
    await signIn(page, 'grace@nimbus.io');
    await page.getByRole('button', { name: 'Account menu' }).click();
    await page.getByRole('menuitem', { name: 'Your projects' }).click();
    await expect(breadcrumb(page)).toBeVisible();
    const viewer = await new AxeBuilder({ page }).include('main').analyze();
    expect(viewer.violations).toEqual([]);

    await page.getByRole('button', { name: 'Account menu' }).click();
    await page.getByRole('menuitem', { name: 'Sign out' }).click();
    await signIn(page);
    await openTeam(page);
    await page.getByRole('link', { name: 'Ada Lovelace' }).click();
    await expect(breadcrumb(page)).toBeVisible();
    const admin = await new AxeBuilder({ page }).include('main').analyze();
    expect(admin.violations).toEqual([]);
  });

  for (const width of [320, 390] as const) {
    test(`on a ${width}px phone a long name wraps and every level stays whole on screen`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 740 });
      await signIn(page);
      await openTeam(page);
      await page.getByRole('link', { name: 'Maria Salomea Skłodowska-Curie' }).click();
      await page.getByRole('link', { name: 'Projects' }).click();
      await expect(
        page.getByRole('heading', { name: 'Projects of Maria Salomea Skłodowska-Curie' }),
      ).toBeVisible();

      const overflow = await page.evaluate(function measureOverflow() {
        const root = document.documentElement;
        return root.scrollWidth - root.clientWidth;
      });
      expect(overflow, 'no sideways scroll').toBe(0);

      const levels = breadcrumb(page).locator(
        '[data-pharos-slot="breadcrumb-link"], [data-pharos-slot="breadcrumb-page"]',
      );
      await expect(levels).toHaveText(['Team', 'Maria Salomea Skłodowska-Curie', 'Projects']);
      for (const level of await levels.all()) {
        const box = (await level.boundingBox())!;
        expect(box.x).toBeGreaterThanOrEqual(0);
        expect(box.x + box.width).toBeLessThanOrEqual(width);
        expect(box.height, 'a target of at least 24px').toBeGreaterThanOrEqual(24);
        // Whole: nothing clipped or cut with an ellipsis.
        const clipped = await level.evaluate(function isClipped(element) {
          return (
            element.scrollWidth > element.clientWidth ||
            getComputedStyle(element).textOverflow === 'ellipsis'
          );
        });
        expect(clipped).toBe(false);
      }
    });
  }
});

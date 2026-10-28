import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';
import { signIn } from './helpers';

/** A colour token as this page resolves it, so a token missing from the
 * published CSS fails the comparison instead of passing as transparent. */
async function resolveToken(page: Page, token: string): Promise<string> {
  const color = await page.evaluate(function resolveColor(name) {
    const probe = document.createElement('span');
    probe.style.color = `var(${name})`;
    document.body.append(probe);
    const resolved = getComputedStyle(probe).color;
    probe.remove();
    return resolved;
  }, token);
  expect(color).not.toBe('rgba(0, 0, 0, 0)');
  return color;
}

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page);
  });

  test('marks the projects with the brand accent badges', async ({ page }) => {
    const topics = page.getByRole('list', { name: 'Project topics' });
    const mark = topics.getByText('Q3 plan');
    await expect(mark).toHaveAttribute('data-pharos-variant', 'accent');
    await expect(mark).toHaveCSS(
      'background-color',
      await resolveToken(page, '--pharos-color-accent-terracotta-700'),
    );

    const tags = topics.locator('[data-pharos-variant="accent-soft"]');
    await expect(tags).toHaveText(['Design', 'Platform', 'Growth']);
    await expect(tags.first()).toHaveCSS(
      'background-color',
      await resolveToken(page, '--pharos-color-accent-terracotta-50'),
    );
    await expect(tags.first()).toHaveCSS(
      'color',
      await resolveToken(page, '--pharos-color-accent-terracotta-700'),
    );
  });
});

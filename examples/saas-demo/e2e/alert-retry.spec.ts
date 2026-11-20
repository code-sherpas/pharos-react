import AxeBuilder from '@axe-core/playwright';
import { test, expect, type Locator, type Page } from '@playwright/test';
import { answerRequests, holdRequests, signIn } from './helpers';

// Alert with an AlertAction on the Settings page: the Billing section could
// not be loaded, says so in a `destructive` Alert and offers «Retry». A retry
// that fails again is told in the same alert, with new text, so it is seen and
// announced; one that works removes the alert and shows the billing. Beside
// it, an empty section and one the person may not see look and read apart.

async function openSettings(page: Page) {
  await holdRequests(page);
  await signIn(page);
  await page.getByRole('button', { name: 'Settings' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Settings' })).toBeVisible();
}

function section(page: Page, name: string): Locator {
  return page.getByRole('region', { name });
}

/**
 * Marks the alert's element, so the test can tell whether a later alert is
 * the same live region (its text changed in it, and was announced) or a new
 * one (mounted anew, with the focus lost).
 */
function markTheRegion(alert: Locator) {
  return alert.evaluate(function mark(node) {
    node.setAttribute('data-test-region', 'first');
  });
}

test.describe('Alert with a retry action', () => {
  test.use({ viewport: { width: 1280, height: 900 } });

  test('says which part failed, tells a retry that fails again, and shows it once it loads', async ({
    page,
  }) => {
    await openSettings(page);
    const billing = section(page, 'Billing');
    const billingHeading = billing.getByRole('heading', { level: 2, name: 'Billing' });

    // While it loads, the section says so, and is busy.
    await expect(billing).toHaveAttribute('aria-busy', 'true');
    await expect(billing.getByRole('status')).toHaveText('Loading billing…');

    await answerRequests(page);

    // It failed: a destructive alert that says which part is missing.
    const alert = billing.getByRole('alert');
    await expect(alert).toHaveAttribute('data-pharos-variant', 'destructive');
    await expect(
      alert.getByRole('heading', { level: 3, name: 'Billing couldn’t be loaded' }),
    ).toBeVisible();
    await expect(alert).toContainText('Your plan and seats aren’t shown.');
    await expect(billing).toHaveAttribute('aria-busy', 'false');

    // «Retry» is a Pharos Button in the alert's action, after the description:
    // the first stop of the keyboard after the section's heading.
    const retry = alert.getByRole('button', { name: 'Retry' });
    await expect(retry).toHaveAttribute('data-pharos-intent', 'secondary');
    await expect(alert.locator('[data-pharos-slot="alert-action"]')).toContainText('Retry');
    const description = alert.locator('[data-pharos-slot="alert-description"]');
    const descriptionBox = (await description.boundingBox())!;
    expect((await retry.boundingBox())!.y).toBeGreaterThanOrEqual(
      descriptionBox.y + descriptionBox.height,
    );
    await billingHeading.focus();
    await page.keyboard.press('Tab');
    await expect(retry).toBeFocused();

    expect(
      (await new AxeBuilder({ page }).include('.workspace-sections').analyze()).violations,
    ).toEqual([]);

    // A retry on its way: said in the same alert, Retry unavailable the
    // focusable way, and still focused.
    await markTheRegion(alert);
    await page.keyboard.press('Enter');
    await expect(alert).toContainText('Trying again…');
    await expect(retry).toHaveAttribute('aria-disabled', 'true');
    await expect(retry).toBeFocused();
    // Pressing it again meanwhile sends nothing more.
    await page.keyboard.press('Enter');

    // It failed again: the text says so — not the same notice as before — in
    // the same live region, so a screen reader announces the change, and the
    // focus stays on Retry.
    await answerRequests(page);
    await expect(alert).toContainText('Still couldn’t load it after 2 attempts.');
    await expect(alert).not.toContainText('Your plan and seats aren’t shown.');
    await expect(alert).toHaveAttribute('data-test-region', 'first');
    await expect(retry).not.toHaveAttribute('aria-disabled');
    await expect(retry).toBeFocused();

    // It works: the alert goes, the billing shows, and the focus moves to the
    // section's heading, where what just appeared starts.
    await page.keyboard.press('Enter');
    await expect(alert).toContainText('Trying again…');
    await answerRequests(page);
    await expect(billing.getByRole('alert')).toHaveCount(0);
    await expect(billing.getByRole('definition').first()).toHaveText('Team');
    await expect(billing).toContainText('8 of 10');
    await expect(billingHeading).toBeFocused();
  });

  test('tells a failed section apart from an empty one and from one the person may not see', async ({
    page,
  }) => {
    await openSettings(page);
    await answerRequests(page);

    const failed = section(page, 'Billing').getByRole('alert');
    const apps = section(page, 'Connected apps');
    const audit = section(page, 'Audit log');

    // Failed: role="alert", a red bar and a circled «!», and «Retry».
    await expect(failed).toHaveAttribute('data-pharos-variant', 'destructive');
    await expect(failed.locator('[data-pharos-slot="alert-icon"]')).toHaveAttribute(
      'data-pharos-icon',
      'circle-alert',
    );
    await expect(failed.getByRole('button', { name: 'Retry' })).toBeVisible();

    // Empty: no notice at all, and it says how it fills.
    await expect(apps.getByRole('alert')).toHaveCount(0);
    await expect(apps.getByRole('status')).toHaveCount(0);
    await expect(apps).toContainText('No apps are connected to this workspace yet.');
    await expect(apps).toContainText('Connect one from the app’s own settings');

    // May not see: role="status", an «i», who can see it, and nothing to retry.
    const refusal = audit.getByRole('status');
    await expect(refusal).toHaveAttribute('data-pharos-variant', 'info');
    await expect(refusal.locator('[data-pharos-slot="alert-icon"]')).toHaveAttribute(
      'data-pharos-icon',
      'info',
    );
    await expect(
      refusal.getByRole('heading', { level: 3, name: 'You can’t see the audit log' }),
    ).toBeVisible();
    await expect(refusal).toContainText('Only workspace admins can.');
    await expect(audit.getByRole('button')).toHaveCount(0);

    // Their bars differ too, so the tone is not the only thing that differs.
    const failedBar = await failed.evaluate(function readBar(node) {
      return getComputedStyle(node).borderInlineStartColor;
    });
    const refusalBar = await refusal.evaluate(function readBar(node) {
      return getComputedStyle(node).borderInlineStartColor;
    });
    expect(failedBar).not.toBe(refusalBar);
  });
});

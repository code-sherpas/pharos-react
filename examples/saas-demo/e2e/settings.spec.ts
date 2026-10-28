import { test, expect } from '@playwright/test';
import type { Locator } from '@playwright/test';
import { signIn } from './helpers';

/**
 * True when every piece of the option's text is inside the option's box and
 * nothing is cut off: no text wider than its container, no ellipsis.
 */
async function fitsWithoutClipping(option: Locator): Promise<boolean> {
  return option.evaluate(function textIsWhole(el) {
    const box = el.getBoundingClientRect();
    return [...el.querySelectorAll('*'), el].every((node) => {
      const style = getComputedStyle(node);
      const r = node.getBoundingClientRect();
      const clipped = node.scrollWidth > node.clientWidth + 1 && style.overflow !== 'visible';
      return !clipped && style.textOverflow !== 'ellipsis' && r.right <= box.right + 1;
    });
  });
}

/** A phone-sized viewport, where long options no longer fit on one line. */
const PHONE = { width: 360, height: 780 };

/** True when the option's text runs over more than one line. */
async function spansSeveralLines(option: Locator): Promise<boolean> {
  return option.evaluate(function wraps(el) {
    const lineHeight = parseFloat(getComputedStyle(el).lineHeight);
    const text = el.firstElementChild ?? el;
    return text.getBoundingClientRect().height > lineHeight * 1.5;
  });
}

// Every form atom composed on one page: Input validation, the Select listbox,
// and the multi-select Combobox chips.
test.describe('Settings form', () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page);
    await page.getByRole('button', { name: 'Settings' }).click();
    await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible();
  });

  test('validates the required display name', async ({ page }) => {
    await page.getByLabel('Display name').fill('');
    await page.getByRole('button', { name: 'Save changes' }).click();
    await expect(page.getByRole('alert')).toHaveText(/display name is required/i);
    await expect(page.getByLabel('Display name')).toHaveAttribute('aria-invalid', 'true');
  });

  test('selects a profile visibility from the listbox', async ({ page }) => {
    const trigger = page.getByRole('combobox', { name: 'Profile visibility' });
    await trigger.click();
    await page.getByRole('option', { name: 'Public' }).click();
    await expect(trigger).toHaveText(/public/i);
  });

  test('removes a skill chip in the multi-select combobox', async ({ page }) => {
    await expect(page.getByText('React', { exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Remove' }).click();
    await expect(page.getByText('React', { exact: true })).toHaveCount(0);
  });

  test('saves valid settings', async ({ page }) => {
    await page.getByLabel('Display name').fill('Ada L.');
    await page.getByRole('button', { name: 'Save changes' }).click();
    await expect(page.getByText(/settings saved/i)).toBeVisible();
  });

  test('shows the data region locked, looking as unavailable as any disabled field', async ({
    page,
  }) => {
    const region = page.getByRole('combobox', { name: 'Data region' });
    await expect(region).toBeDisabled();
    await expect(region).toHaveValue('Europe (Frankfurt)');
    await expect(region).toHaveAccessibleDescription('Set by your workspace admin.');
    await expect(page.getByRole('button', { name: 'Open data regions' })).toBeDisabled();

    const control = page.locator('[data-pharos-slot="combobox-control"]', { has: region });
    await expect(control).toHaveCSS('opacity', '0.5');
    await expect(control).toHaveCSS('cursor', 'not-allowed');
  });

  test('filters and picks a value in the single-select combobox', async ({ page }) => {
    const input = page.getByRole('combobox', { name: 'Timezone' });
    await input.click();
    await input.fill('Mad');
    // Typing narrows the list to matching options only.
    await expect(page.getByRole('option', { name: 'Europe/Madrid' })).toBeVisible();
    await expect(page.getByRole('option', { name: 'UTC' })).toHaveCount(0);
    await page.getByRole('option', { name: 'Europe/Madrid' }).click();
    await expect(input).toHaveValue('Europe/Madrid');
  });

  test('shows a long listbox option whole, on as many lines as it needs', async ({ page }) => {
    await page.setViewportSize(PHONE);
    await page.getByRole('combobox', { name: 'Profile visibility' }).click();
    const option = page.getByRole('option', {
      name: 'Only the people I invite, one by one, to each of my projects',
    });
    await expect(option).toBeVisible();
    expect(await fitsWithoutClipping(option)).toBe(true);
    expect(await spansSeveralLines(option)).toBe(true);
    await option.click();
    await expect(page.getByRole('combobox', { name: 'Profile visibility' })).toHaveText(
      /only the people I invite/i,
    );
  });

  test('shows a long combobox option whole, on as many lines as it needs', async ({ page }) => {
    await page.setViewportSize(PHONE);
    const input = page.getByRole('combobox', { name: 'Timezone' });
    await input.click();
    await input.fill('Mexico');
    const option = page.getByRole('option', {
      name: '(GMT-06:00) America/Mexico_City — Central Standard Time (Mexico)',
    });
    await expect(option).toBeVisible();
    expect(await fitsWithoutClipping(option)).toBe(true);
    expect(await spansSeveralLines(option)).toBe(true);
    await option.click();
    await expect(input).toHaveValue(
      '(GMT-06:00) America/Mexico_City — Central Standard Time (Mexico)',
    );
  });

  test('filters and adds a chip in the multi-select combobox', async ({ page }) => {
    const input = page.getByRole('combobox', { name: 'Skills' });
    await input.click();
    await input.fill('Type');
    await expect(page.getByRole('option', { name: 'TypeScript' })).toBeVisible();
    await page.getByRole('option', { name: 'TypeScript' }).click();
    // The selection becomes a chip alongside the initial one. Scope to the
    // chip slot: the popup stays open, so the option text is still on screen.
    const chips = page.locator('[data-pharos-slot="combobox-chip"]');
    await expect(chips.filter({ hasText: 'TypeScript' })).toHaveCount(1);
    await expect(chips.filter({ hasText: 'React' })).toHaveCount(1);
  });

  test('toggles the email-updates checkbox', async ({ page }) => {
    const box = page.getByRole('checkbox', { name: 'Email me product updates' });
    await expect(box).toHaveAttribute('aria-checked', 'true');
    await box.click();
    await expect(box).toHaveAttribute('aria-checked', 'false');
    // Label click toggles it back (label/control association).
    await page.getByText('Email me product updates').click();
    await expect(box).toHaveAttribute('aria-checked', 'true');
  });

  test('toggles the weekly-digest switch', async ({ page }) => {
    const toggle = page.getByRole('switch', { name: 'Send me a weekly digest' });
    await expect(toggle).toHaveAttribute('aria-checked', 'false');
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-checked', 'true');
    // Label click toggles it back (label/control association).
    await page.getByText('Send me a weekly digest').click();
    await expect(toggle).toHaveAttribute('aria-checked', 'false');
  });

  test('paints the off switch on the warm paper track', async ({ page }) => {
    const toggle = page.getByRole('switch', { name: 'Send me a weekly digest' });
    await expect(toggle).toHaveAttribute('aria-checked', 'false');
    // The token as this page resolves it, so a token missing from the
    // published CSS fails here instead of leaving the track transparent.
    const paper300 = await page.evaluate(function resolvePaper300() {
      const probe = document.createElement('span');
      probe.style.backgroundColor = 'var(--pharos-color-paper-300)';
      document.body.append(probe);
      const color = getComputedStyle(probe).backgroundColor;
      probe.remove();
      return color;
    });
    expect(paper300).not.toBe('rgba(0, 0, 0, 0)');
    await expect(toggle).toHaveCSS('background-color', paper300);
  });

  test('picks a single theme in the radio group', async ({ page }) => {
    const group = page.getByRole('radiogroup', { name: 'Theme' });
    const system = group.getByRole('radio', { name: 'Match system' });
    const light = group.getByRole('radio', { name: 'Light' });
    // Seeded selection is "system".
    await expect(system).toHaveAttribute('aria-checked', 'true');
    await expect(light).toHaveAttribute('aria-checked', 'false');

    // Selecting another option enforces single selection.
    await light.click();
    await expect(light).toHaveAttribute('aria-checked', 'true');
    await expect(system).toHaveAttribute('aria-checked', 'false');

    // Arrow keys move the selection (roving radiogroup semantics).
    await light.press('ArrowDown');
    await expect(group.getByRole('radio', { name: 'Dark' })).toHaveAttribute(
      'aria-checked',
      'true',
    );
    await expect(light).toHaveAttribute('aria-checked', 'false');
  });
});

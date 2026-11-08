import { test, expect } from '@playwright/test';
import { layerAtTheCorner, layerOf, signIn } from './helpers';

// The Sheet (modal drawer) and — critically — a Select opened from INSIDE it.
// The Select's list sits on the popover layer, above the Sheet's modal layer
// (D29); if the layering regressed, the option below would be behind the
// panel and unclickable. This is the LanguageSelector-in-a-drawer scenario.
test.describe('New project sheet', () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page);
  });

  test('opens, and a Select inside it stacks above the panel', async ({ page }) => {
    await page.getByRole('button', { name: 'New project' }).click();
    await expect(page.getByRole('dialog', { name: 'New project' })).toBeVisible();

    const select = page.getByRole('combobox', { name: 'Visibility' });
    await select.click();
    await page.getByRole('option', { name: 'Public' }).click();
    await expect(select).toHaveText(/public/i);

    await page.getByRole('button', { name: 'Cancel' }).click();
    await expect(page.getByRole('dialog', { name: 'New project' })).toHaveCount(0);
  });

  // D29: backdrop and panel share the modal layer, so a modal opened over
  // another one covers it, backdrop included; the Select's list sits on the
  // popover layer above both.
  test('its backdrop shares the panel layer and a Select list sits above it', async ({ page }) => {
    await page.getByRole('button', { name: 'New project' }).click();
    const panel = page.getByRole('dialog', { name: 'New project' });
    await expect(panel).toBeVisible();

    const panelLayer = await layerOf(panel);
    expect(await layerAtTheCorner(page)).toBe(panelLayer);

    await page.getByRole('combobox', { name: 'Visibility' }).click();
    const list = page.getByRole('listbox');
    await expect(list).toBeVisible();
    expect(await layerOf(list)).toBeGreaterThan(panelLayer);
  });

  // prefers-reduced-motion: the panel opens and closes where it rests, with no
  // slide in from its edge. Sampled every frame, from before the click until
  // the panel is gone, so the starting and ending frames are both seen.
  test('with reduced motion, it opens and closes without sliding', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.evaluate(function samplePanelEdgeEveryFrame() {
      const positions: number[] = [];
      (window as unknown as { sheetPositions: number[] }).sheetPositions = positions;
      function sample() {
        const panel = document.querySelector('[data-pharos-slot="sheet-content"]');
        if (panel) positions.push(Math.round(panel.getBoundingClientRect().left));
        requestAnimationFrame(sample);
      }
      requestAnimationFrame(sample);
    });

    await page.getByRole('button', { name: 'New project' }).click();
    const panel = page.getByRole('dialog', { name: 'New project' });
    await expect(panel).toBeVisible();
    const restingLeft = Math.round((await panel.boundingBox())!.x);
    await page.keyboard.press('Escape');
    await expect(panel).toHaveCount(0);

    const positions = await page.evaluate(function readPositions() {
      return (window as unknown as { sheetPositions: number[] }).sheetPositions;
    });
    expect(positions.length).toBeGreaterThan(0);
    expect(new Set(positions)).toEqual(new Set([restingLeft]));
  });

  test('closes on Escape and returns focus to the trigger', async ({ page }) => {
    const trigger = page.getByRole('button', { name: 'New project' });
    await trigger.click();
    await expect(page.getByRole('dialog', { name: 'New project' })).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog', { name: 'New project' })).toHaveCount(0);
    await expect(trigger).toBeFocused();
  });
});

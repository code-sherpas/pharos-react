import { expect, type Locator, type Page } from '@playwright/test';

/** Sign in and land on the Dashboard — the entry point for shell/page specs. */
export async function signIn(page: Page, email = 'ada@nimbus.io') {
  await page.goto('/');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill('correct-horse');
  await page.getByRole('button', { name: /sign in/i }).click();
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
}

/**
 * The z-index layer an element paints on: its own, or that of the nearest
 * ancestor that sets one (a Select's list takes it from its positioner).
 */
export function layerOf(locator: Locator): Promise<number> {
  return locator.evaluate(function readLayer(element) {
    for (let node: Element | null = element; node !== null; node = node.parentElement) {
      const zIndex = getComputedStyle(node).zIndex;
      if (zIndex !== 'auto') return Number(zIndex);
    }
    return 0;
  });
}

/** The layer of whatever paints on top at the top-left corner of the viewport. */
export function layerAtTheCorner(page: Page): Promise<number> {
  return page.evaluate(function readCornerLayer() {
    for (let node = document.elementFromPoint(1, 1); node !== null; node = node.parentElement) {
      const zIndex = getComputedStyle(node).zIndex;
      if (zIndex !== 'auto') return Number(zIndex);
    }
    return 0;
  });
}

/** Makes the demo backend wait for {@link answerRequests} instead of a timer. */
export async function holdRequests(page: Page) {
  await page.addInitScript(function holdDemoRequests() {
    (window as Window & { demoRequests?: unknown }).demoRequests = { held: true, waiting: [] };
  });
}

/** Answers every request the demo backend is holding. */
export async function answerRequests(page: Page) {
  await page.evaluate(function answerHeldRequests() {
    const held = (window as Window & { demoRequests?: { waiting: (() => void)[] } }).demoRequests;
    held?.waiting.splice(0).forEach(function answer(respond) {
      respond();
    });
  });
}

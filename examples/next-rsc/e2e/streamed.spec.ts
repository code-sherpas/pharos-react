import { test, expect, type Page } from '@playwright/test';

/**
 * A page that streams inside a shell wrapped by `<SidePanel>`. It must hydrate
 * from the HTML the server sent, on any screen: if the panel changed its
 * context while hydrating (as it did on a narrow screen, switching to its modal
 * form), React would render the pending page in the browser instead, and for an
 * instant the page would be in the DOM twice — the browser's copy and the
 * server's hidden one.
 *
 * Observable: how many distinct page elements were ever attached to the
 * document. Hydrated, the one the server streamed is moved into place: one.
 * Rendered in the browser, there is a second one.
 */
async function countPageElementsEverAttached(page: Page): Promise<number> {
  return page.evaluate(function readCount() {
    return (window as unknown as { __streamedPages: Set<Element> }).__streamedPages.size;
  });
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript(function recordStreamedPages() {
    const seen = new Set<Element>();
    (window as unknown as { __streamedPages: Set<Element> }).__streamedPages = seen;
    function record(node: Node) {
      if (!(node instanceof Element)) return;
      if (node.matches('[data-streamed-page]')) seen.add(node);
      for (const inner of node.querySelectorAll('[data-streamed-page]')) seen.add(inner);
    }
    new MutationObserver(function onMutations(mutations) {
      for (const mutation of mutations) mutation.addedNodes.forEach(record);
    }).observe(document, { childList: true, subtree: true });
  });
});

for (const [device, width, mode] of [
  ['a phone', 390, 'modal'],
  ['a desktop', 1280, 'inline'],
] as const) {
  test(`on ${device}, a page streaming beside a SidePanel hydrates from the server HTML`, async ({
    page,
  }) => {
    const pageErrors: string[] = [];
    page.on('pageerror', (err) => pageErrors.push(err.message));
    await page.setViewportSize({ width, height: 844 });

    // Not waiting for `load`: it fires only once the whole response has streamed.
    await page.goto('/streamed', { waitUntil: 'commit' });

    // The shell hydrated before the page arrived: on a phone, the panel is in
    // its modal form, which only the browser can know.
    await expect(page.getByText('Loading the report…')).toBeVisible();
    const trigger = page.getByRole('button', { name: 'Assistant' });
    if (mode === 'modal') await expect(trigger).toHaveAttribute('aria-haspopup', 'dialog');
    else await expect(trigger).not.toHaveAttribute('aria-haspopup');

    await expect(page.getByRole('heading', { name: 'Quarterly report' })).toBeVisible();
    await expect(page.getByText('The report the server sent.')).toHaveCount(1);
    expect(await countPageElementsEverAttached(page)).toBe(1);

    // The panel still opens in the form for the screen.
    await trigger.click();
    if (mode === 'modal') {
      await expect(page.getByRole('dialog', { name: 'Assistant' })).toBeVisible();
    } else {
      await expect(page.getByRole('complementary', { name: 'Assistant' })).toBeVisible();
    }
    expect(pageErrors, `unexpected page errors:\n${pageErrors.join('\n')}`).toHaveLength(0);
  });
}

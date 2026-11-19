import { test, expect, type Locator, type Page } from '@playwright/test';
import { signIn } from './helpers';

// «New pillar» on the Taxonomy page, a form taller than a phone, with the
// on-screen keyboard open. A phone keyboard covers the bottom of the window
// without resizing it (iOS Safari, Chrome on Android by default): only the
// visual viewport, the part the browser shows, gets shorter. A desktop
// browser has no on-screen keyboard, so the visual viewport is replaced by
// one the test shortens and moves the way a phone's keyboard does. Below
// `breakpoint.compact` the full-screen dialog follows it: the footer sits
// right above the keyboard and the focused field stays in view. From the
// breakpoint up (a phone turned sideways, a tablet) the centered panel is
// centred in what the keyboard leaves and no taller than it. With no keyboard
// the visual viewport is the window, so on a desktop nothing moves.
const PHONE = { width: 375, height: 812 };
const PHONE_TURNED = { width: 812, height: 375 };
const DESKTOP = { width: 1280, height: 800 };
/** About what an iPhone keyboard with its suggestion bar takes, in CSS px. */
const KEYBOARD = 336;
/** The same keyboard with the phone turned sideways. */
const KEYBOARD_TURNED = 160;

interface OnScreenKeyboard {
  open(height: number, scrolledBy?: number): void;
  close(): void;
}

declare global {
  interface Window {
    onScreenKeyboard: OnScreenKeyboard;
  }
}

/** A visual viewport the window's keyboard shortens; the window itself keeps its size. */
function installOnScreenKeyboard() {
  const visualViewport = new EventTarget();
  const keyboard = { height: 0, scrolledBy: 0 };
  Object.defineProperties(visualViewport, {
    width: { get: () => window.innerWidth },
    height: { get: () => window.innerHeight - keyboard.height },
    offsetLeft: { get: () => 0 },
    offsetTop: { get: () => keyboard.scrolledBy },
    pageLeft: { get: () => window.scrollX },
    pageTop: { get: () => window.scrollY + keyboard.scrolledBy },
    scale: { get: () => 1 },
  });
  Object.defineProperty(window, 'visualViewport', {
    configurable: true,
    get: () => visualViewport,
  });
  // A real visual viewport also changes when the window does.
  window.addEventListener('resize', function windowResized() {
    visualViewport.dispatchEvent(new Event('resize'));
  });
  function change(height: number, scrolledBy: number) {
    keyboard.height = height;
    keyboard.scrolledBy = scrolledBy;
    visualViewport.dispatchEvent(new Event('resize'));
    visualViewport.dispatchEvent(new Event('scroll'));
  }
  window.onScreenKeyboard = {
    open(height: number, scrolledBy = 0) {
      change(height, scrolledBy);
    },
    close() {
      change(0, 0);
    },
  };
}

function openKeyboard(page: Page, scrolledBy = 0, height = KEYBOARD) {
  return page.evaluate(
    function open([keyboardHeight, by]) {
      window.onScreenKeyboard.open(keyboardHeight, by);
    },
    [height, scrolledBy] as const,
  );
}

function closeKeyboard(page: Page) {
  return page.evaluate(function close() {
    window.onScreenKeyboard.close();
  });
}

async function openNewPillar(page: Page, { simulateKeyboard = true } = {}) {
  if (simulateKeyboard) await page.addInitScript(installOnScreenKeyboard);
  await signIn(page);
  await page.getByRole('button', { name: 'Taxonomy', exact: true }).click();
  await page.getByRole('button', { name: 'New pillar' }).click();
  const dialog = page.getByRole('dialog', { name: 'New pillar' });
  await expect(dialog).toBeVisible();
  await dialog.evaluate(function settle(node) {
    return Promise.all(node.getAnimations().map((animation) => animation.finished));
  });
  return {
    dialog,
    header: dialog.locator('[data-pharos-slot="dialog-header"]'),
    footer: dialog.locator('[data-pharos-slot="dialog-footer"]'),
  };
}

/** Whether the centre of `target` is what the person sees at that point. */
function isOnTop(target: Locator): Promise<boolean> {
  return target.evaluate(function seenAtItsCentre(node) {
    const box = node.getBoundingClientRect();
    const seen = document.elementFromPoint(box.x + box.width / 2, box.y + box.height / 2);
    return seen !== null && (node === seen || node.contains(seen));
  });
}

/** Whether `target` lies wholly between the bottom of the header and the top of the footer. */
async function isBetween(target: Locator, header: Locator, footer: Locator) {
  const box = (await target.boundingBox())!;
  const headerBox = (await header.boundingBox())!;
  const footerBox = (await footer.boundingBox())!;
  return box.y >= headerBox.y + headerBox.height - 0.5 && box.y + box.height <= footerBox.y + 0.5;
}

test.describe('Dialog on a phone with the keyboard open', () => {
  test.use({ viewport: PHONE });

  test('the footer sits right above the keyboard and the last field stays in view', async ({
    page,
  }) => {
    const { dialog, header, footer } = await openNewPillar(page);
    const notes = dialog.getByLabel('Notes for reviewers');
    await notes.focus();
    await expect(notes).toBeFocused();
    // Where the keyboard is about to open: the last field is there now.
    expect((await notes.boundingBox())!.y + 1).toBeGreaterThan(PHONE.height - KEYBOARD);

    await openKeyboard(page);
    const visibleHeight = PHONE.height - KEYBOARD;
    await expect
      .poll(() => dialog.boundingBox())
      .toEqual({ x: 0, y: 0, width: 375, height: visibleHeight });
    const footerBox = (await footer.boundingBox())!;
    expect(footerBox.y + footerBox.height).toBeCloseTo(visibleHeight, 0);
    expect((await header.boundingBox())!.y).toBe(0);

    // The focused field was brought into what the keyboard left of the body.
    await expect(notes).toBeFocused();
    expect(await isBetween(notes, header, footer)).toBe(true);
    expect(await isOnTop(notes)).toBe(true);

    // «Cancel» and «Create pillar» are reachable without closing the keyboard.
    const create = dialog.getByRole('button', { name: 'Create pillar' });
    const cancel = dialog.getByRole('button', { name: 'Cancel' });
    for (const action of [create, cancel]) {
      const box = (await action.boundingBox())!;
      expect(box.y + box.height).toBeLessThanOrEqual(visibleHeight);
      expect(await isOnTop(action)).toBe(true);
    }

    // Typing goes on in the field, and «Create pillar» takes it.
    await notes.pressSequentially('Check it against the 2026 review.');
    await dialog.getByLabel('Name').fill('Communication');
    await create.click();
    await expect(dialog).toHaveCount(0);
    await expect(page.getByRole('treeitem', { name: /Communication/ })).toBeVisible();
  });

  test('takes the whole height back when the keyboard closes', async ({ page }) => {
    const { dialog, footer } = await openNewPillar(page);
    await dialog.getByLabel('Name').focus();
    await openKeyboard(page);
    await expect
      .poll(async () => (await dialog.boundingBox())!.height)
      .toBe(PHONE.height - KEYBOARD);

    await closeKeyboard(page);
    await expect.poll(() => dialog.boundingBox()).toEqual({ x: 0, y: 0, ...PHONE });
    const footerBox = (await footer.boundingBox())!;
    expect(footerBox.y + footerBox.height).toBe(PHONE.height);
    await expect(dialog.getByLabel('Name')).toBeFocused();
  });

  // iOS Safari scrolls the visual viewport down the window to show the field;
  // the panel goes with it instead of staying at the top of the window.
  test('goes with the visual viewport when the browser scrolls it', async ({ page }) => {
    const { dialog, footer } = await openNewPillar(page);
    await dialog.getByLabel('Notes for reviewers').focus();
    await openKeyboard(page, 200);
    await expect
      .poll(() => dialog.boundingBox())
      .toEqual({
        x: 0,
        y: 200,
        width: PHONE.width,
        height: PHONE.height - KEYBOARD,
      });
    const footerBox = (await footer.boundingBox())!;
    expect(footerBox.y + footerBox.height).toBeCloseTo(200 + PHONE.height - KEYBOARD, 0);
    expect(await isOnTop(dialog.getByRole('button', { name: 'Create pillar' }))).toBe(true);
  });

  test('turning the phone with the keyboard open keeps what was typed and the focus', async ({
    page,
  }) => {
    const { dialog, footer } = await openNewPillar(page);
    const notes = dialog.getByLabel('Notes for reviewers');
    await notes.fill('Check it against the 2026 review.');
    await openKeyboard(page);

    // 812px wide is above the compact breakpoint: the centered panel, kept
    // in what the (shorter) keyboard leaves.
    await page.setViewportSize(PHONE_TURNED);
    await openKeyboard(page, 0, KEYBOARD_TURNED);
    await expect(dialog).toHaveAttribute('data-pharos-mode', 'centered');
    await expect(dialog).toHaveCSS('max-width', '512px');
    await expect
      .poll(async () => {
        const box = (await dialog.boundingBox())!;
        return box.y + box.height;
      })
      .toBeLessThanOrEqual(PHONE_TURNED.height - KEYBOARD_TURNED);
    await expect(notes).toBeFocused();

    await openKeyboard(page);
    await page.setViewportSize(PHONE);
    await expect(dialog).toHaveAttribute('data-pharos-mode', 'fullscreen');
    await expect
      .poll(async () => (await dialog.boundingBox())!.height)
      .toBe(PHONE.height - KEYBOARD);
    await expect(notes).toBeFocused();
    await expect(notes).toHaveValue('Check it against the 2026 review.');
    const footerBox = (await footer.boundingBox())!;
    expect(footerBox.y + footerBox.height).toBeCloseTo(PHONE.height - KEYBOARD, 0);
  });
});

test.describe('Dialog on a phone turned sideways with the keyboard open', () => {
  test.use({ viewport: PHONE_TURNED });

  test('the centered panel stays in what the keyboard leaves, footer included', async ({
    page,
  }) => {
    const { dialog, footer } = await openNewPillar(page);
    await expect(dialog).toHaveAttribute('data-pharos-mode', 'centered');
    const notes = dialog.getByLabel('Notes for reviewers');
    await notes.focus();

    await openKeyboard(page, 0, KEYBOARD_TURNED);
    const visibleHeight = PHONE_TURNED.height - KEYBOARD_TURNED;
    // Centred in the visible area and wholly above the keyboard.
    await expect
      .poll(async () => {
        const box = (await dialog.boundingBox())!;
        return box.y + box.height / 2;
      })
      .toBeCloseTo(visibleHeight / 2, 0);
    const box = (await dialog.boundingBox())!;
    expect(box.y).toBeGreaterThan(0);
    expect(box.y + box.height).toBeLessThanOrEqual(visibleHeight);

    // The focused field was brought into the panel's visible part.
    await expect(notes).toBeFocused();
    const notesBox = (await notes.boundingBox())!;
    expect(notesBox.y).toBeLessThan(box.y + box.height);
    expect(notesBox.y + notesBox.height).toBeGreaterThan(box.y);

    // The footer is at the end of the body, above the keyboard: «Cancel» and
    // «Create pillar» are reached by scrolling the panel, never covered.
    await dialog.evaluate(function scrollToEnd(node) {
      node.scrollTop = node.scrollHeight;
    });
    const footerBox = (await footer.boundingBox())!;
    expect(footerBox.y + footerBox.height).toBeLessThanOrEqual(visibleHeight);
    for (const name of ['Cancel', 'Create pillar']) {
      expect(await isOnTop(dialog.getByRole('button', { name }))).toBe(true);
    }

    // Keyboard closed: centred in the window again.
    await closeKeyboard(page);
    await expect
      .poll(async () => {
        const closed = (await dialog.boundingBox())!;
        return closed.y + closed.height / 2;
      })
      .toBeCloseTo(PHONE_TURNED.height / 2, 0);
  });
});

test.describe('Dialog on a desktop, with no on-screen keyboard', () => {
  test.use({ viewport: DESKTOP });

  // Chromium's own visual viewport, not the simulated one.
  test('is the centered panel, as before', async ({ page }) => {
    const { dialog, header, footer } = await openNewPillar(page, { simulateKeyboard: false });
    expect(await page.evaluate(() => window.visualViewport?.height)).toBe(DESKTOP.height);
    await expect(dialog).toHaveAttribute('data-pharos-mode', 'centered');
    const box = (await dialog.boundingBox())!;
    expect(box.width).toBe(512);
    expect(box.x + box.width / 2).toBeCloseTo(DESKTOP.width / 2, 0);
    expect(box.y + box.height / 2).toBeCloseTo(DESKTOP.height / 2, 0);
    // 100dvh minus the margins, as in 4.0.0.
    await expect(dialog).toHaveCSS('max-height', `${DESKTOP.height - 48}px`);
    await expect(header).toHaveCSS('position', 'static');
    await expect(footer).toHaveCSS('position', 'static');
  });
});

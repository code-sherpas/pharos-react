import { afterEach, describe, it, expect, vi } from 'vitest';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { tokens } from '@code-sherpas/pharos-tokens';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogCancel,
} from '../src/components/AlertDialog';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '../src/components/Dialog';

function renderDialog() {
  return render(
    <Dialog>
      <DialogTrigger>Delete</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete project?</DialogTitle>
          <DialogDescription>This cannot be undone.</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose>Cancel</DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>,
  );
}

describe('Dialog', () => {
  it('renders the trigger and keeps the dialog closed initially', () => {
    renderDialog();
    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('opens on trigger click and is labelled by its title', async () => {
    const user = userEvent.setup();
    renderDialog();

    await user.click(screen.getByRole('button', { name: 'Delete' }));

    // Base UI wires aria-labelledby from the title, giving the dialog a name.
    expect(await screen.findByRole('dialog', { name: 'Delete project?' })).toBeInTheDocument();
  });

  it('tags the content surface via data-pharos-slot', async () => {
    const user = userEvent.setup();
    renderDialog();

    await user.click(screen.getByRole('button', { name: 'Delete' }));

    expect(await screen.findByRole('dialog')).toHaveAttribute('data-pharos-slot', 'dialog-content');
  });

  it('closes via the DialogClose button', async () => {
    const user = userEvent.setup();
    renderDialog();

    await user.click(screen.getByRole('button', { name: 'Delete' }));
    expect(await screen.findByRole('dialog')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('closes on Escape', async () => {
    const user = userEvent.setup();
    renderDialog();

    await user.click(screen.getByRole('button', { name: 'Delete' }));
    expect(await screen.findByRole('dialog')).toBeInTheDocument();

    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('composes the trigger as a custom element via render', async () => {
    const user = userEvent.setup();
    render(
      <Dialog>
        <DialogTrigger render={<button type="button" data-testid="open-btn" aria-label="Open" />} />
        <DialogContent>
          <DialogTitle>Confirm</DialogTitle>
        </DialogContent>
      </Dialog>,
    );

    const trigger = screen.getByTestId('open-btn');
    expect(trigger).toHaveAttribute('aria-label', 'Open');
    await user.click(trigger);
    expect(await screen.findByRole('dialog', { name: 'Confirm' })).toBeInTheDocument();
  });
});

/**
 * jsdom has no `matchMedia`, so the viewport is a double: it says whether the
 * window is compact, records the queries it was asked, and tells listeners
 * when the width crosses the breakpoint.
 */
function viewport(initiallyCompact: boolean) {
  let compact = initiallyCompact;
  const queries: string[] = [];
  const listeners = new Set<() => void>();
  vi.stubGlobal(
    'matchMedia',
    vi.fn(function matchMedia(media: string) {
      queries.push(media);
      return {
        media,
        get matches() {
          return compact;
        },
        addEventListener(_type: string, listener: () => void) {
          listeners.add(listener);
        },
        removeEventListener(_type: string, listener: () => void) {
          listeners.delete(listener);
        },
      };
    }),
  );
  return {
    queries,
    resize(nextCompact: boolean) {
      compact = nextCompact;
      act(function notify() {
        for (const listener of listeners) listener();
      });
    },
  };
}

const PHONE = true;
const DESKTOP = false;

function FormDialog() {
  return (
    <Dialog defaultOpen>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New pillar</DialogTitle>
        </DialogHeader>
        <label htmlFor="pillar-name">Name</label>
        <input id="pillar-name" />
        <DialogFooter>
          <DialogClose>Cancel</DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

describe('Dialog at the compact width', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('is centered from the compact breakpoint up', async () => {
    viewport(DESKTOP);
    render(<FormDialog />);
    expect(await screen.findByRole('dialog', { name: 'New pillar' })).toHaveAttribute(
      'data-pharos-mode',
      'centered',
    );
  });

  it('fills the screen below the compact breakpoint', async () => {
    viewport(PHONE);
    render(<FormDialog />);
    expect(await screen.findByRole('dialog', { name: 'New pillar' })).toHaveAttribute(
      'data-pharos-mode',
      'fullscreen',
    );
  });

  it('takes the breakpoint from pharos-tokens', async () => {
    const screenSize = viewport(PHONE);
    render(<FormDialog />);
    await screen.findByRole('dialog');
    expect(screenSize.queries.some((query) => query.includes(tokens.breakpoint.compact))).toBe(
      true,
    );
  });

  it('still hands the consumer its ref to the panel', async () => {
    viewport(PHONE);
    const panelRef = createRef<HTMLDivElement>();
    render(
      <Dialog defaultOpen>
        <DialogContent ref={panelRef}>
          <DialogTitle>New pillar</DialogTitle>
        </DialogContent>
      </Dialog>,
    );
    expect(panelRef.current).toBe(await screen.findByRole('dialog'));
  });

  it('is centered when the browser cannot tell the width', async () => {
    render(<FormDialog />);
    expect(await screen.findByRole('dialog')).toHaveAttribute('data-pharos-mode', 'centered');
  });

  it('keeps what was typed and the focus when the width crosses the breakpoint', async () => {
    const user = userEvent.setup();
    const screenSize = viewport(PHONE);
    render(<FormDialog />);
    const dialog = await screen.findByRole('dialog', { name: 'New pillar' });
    const name = screen.getByLabelText('Name');
    await user.click(name);
    await user.keyboard('Communication');

    screenSize.resize(DESKTOP);
    expect(dialog).toHaveAttribute('data-pharos-mode', 'centered');
    expect(screen.getByRole('dialog')).toBe(dialog);
    expect(screen.getByLabelText('Name')).toBe(name);
    expect(name).toHaveValue('Communication');
    expect(name).toHaveFocus();

    screenSize.resize(PHONE);
    expect(dialog).toHaveAttribute('data-pharos-mode', 'fullscreen');
    expect(name).toHaveValue('Communication');
    expect(name).toHaveFocus();
  });

  it('keeps the modal contract when full screen: Escape closes and focus returns', async () => {
    const user = userEvent.setup();
    viewport(PHONE);
    renderDialog();
    const trigger = screen.getByRole('button', { name: 'Delete' });

    await user.click(trigger);
    const dialog = await screen.findByRole('dialog', { name: 'Delete project?' });
    expect(dialog).toHaveAttribute('data-pharos-mode', 'fullscreen');
    await waitFor(() => expect(dialog).toContainElement(document.activeElement as HTMLElement));

    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    await waitFor(() => expect(trigger).toHaveFocus());
  });

  it('leaves AlertDialog centered: a confirmation never fills the screen', async () => {
    viewport(PHONE);
    render(
      <AlertDialog defaultOpen>
        <AlertDialogContent>
          <AlertDialogTitle>Remove Ada?</AlertDialogTitle>
          <AlertDialogCancel>Keep Ada</AlertDialogCancel>
        </AlertDialogContent>
      </AlertDialog>,
    );
    expect(await screen.findByRole('alertdialog')).not.toHaveAttribute('data-pharos-mode');
  });
});

/**
 * jsdom has no visual viewport, so it is a double: the part of the window the
 * browser shows, which an on-screen keyboard shortens and a pinch zoom scales,
 * and which tells listeners when it changes, as a real one does.
 */
function visualViewport() {
  const target = new EventTarget();
  const state = { height: 812, offsetTop: 0, scale: 1 };
  Object.defineProperties(target, {
    height: { get: () => state.height },
    offsetTop: { get: () => state.offsetTop },
    scale: { get: () => state.scale },
  });
  vi.stubGlobal('visualViewport', target);
  function change(type: 'resize' | 'scroll', next: Partial<typeof state>) {
    Object.assign(state, next);
    act(function notify() {
      target.dispatchEvent(new Event(type));
    });
  }
  return {
    openKeyboard(height: number, offsetTop = 0) {
      change('resize', { height, offsetTop });
    },
    closeKeyboard() {
      change('resize', { height: 812, offsetTop: 0 });
    },
    scrollTo(offsetTop: number) {
      change('scroll', { offsetTop });
    },
    pinchZoom(scale: number) {
      change('resize', { scale, height: 812 / scale });
    },
  };
}

/** The height and top the panel takes from the visual viewport, if any. */
function followed(dialog: HTMLElement) {
  return {
    top: dialog.style.getPropertyValue('--dialog-viewport-top'),
    height: dialog.style.getPropertyValue('--dialog-viewport-height'),
  };
}

const NOT_FOLLOWED = { top: '', height: '' };

describe('Dialog with the on-screen keyboard open', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('is as tall as what the keyboard leaves, and takes the whole height back', async () => {
    viewport(PHONE);
    const keyboard = visualViewport();
    render(<FormDialog />);
    const dialog = await screen.findByRole('dialog', { name: 'New pillar' });
    expect(followed(dialog)).toEqual({ top: '0px', height: '812px' });

    keyboard.openKeyboard(476);
    expect(followed(dialog)).toEqual({ top: '0px', height: '476px' });

    keyboard.closeKeyboard();
    expect(followed(dialog)).toEqual({ top: '0px', height: '812px' });
  });

  it('moves with the visual viewport when the browser scrolls it', async () => {
    viewport(PHONE);
    const keyboard = visualViewport();
    render(<FormDialog />);
    const dialog = await screen.findByRole('dialog');

    keyboard.openKeyboard(476, 120);
    expect(followed(dialog)).toEqual({ top: '120px', height: '476px' });
    keyboard.scrollTo(40);
    expect(followed(dialog)).toEqual({ top: '40px', height: '476px' });
  });

  it('brings the focused field back into view when the keyboard shortens it', async () => {
    const user = userEvent.setup();
    viewport(PHONE);
    const keyboard = visualViewport();
    render(<FormDialog />);
    const name = screen.getByLabelText('Name');
    await user.click(name);
    name.scrollIntoView = vi.fn();

    keyboard.openKeyboard(476);
    expect(name.scrollIntoView).toHaveBeenCalledWith({ block: 'nearest', inline: 'nearest' });
  });

  it('leaves the focus where it is when the keyboard closes', async () => {
    const user = userEvent.setup();
    viewport(PHONE);
    const keyboard = visualViewport();
    keyboard.openKeyboard(476);
    render(<FormDialog />);
    const name = screen.getByLabelText('Name');
    await user.click(name);
    name.scrollIntoView = vi.fn();

    keyboard.closeKeyboard();
    expect(name.scrollIntoView).not.toHaveBeenCalled();
  });

  it('keeps the whole height under a pinch zoom, which magnifies instead', async () => {
    viewport(PHONE);
    const keyboard = visualViewport();
    render(<FormDialog />);
    const dialog = await screen.findByRole('dialog');

    keyboard.pinchZoom(2);
    expect(followed(dialog)).toEqual(NOT_FOLLOWED);
    keyboard.pinchZoom(1);
    expect(followed(dialog)).toEqual({ top: '0px', height: '812px' });
  });

  it('does not change the centered panel from the compact breakpoint up', async () => {
    viewport(DESKTOP);
    const keyboard = visualViewport();
    render(<FormDialog />);
    const dialog = await screen.findByRole('dialog');

    keyboard.openKeyboard(476);
    expect(followed(dialog)).toEqual(NOT_FOLLOWED);
  });

  it('stops following it once the width crosses the breakpoint', async () => {
    const screenSize = viewport(PHONE);
    const keyboard = visualViewport();
    render(<FormDialog />);
    const dialog = await screen.findByRole('dialog');
    keyboard.openKeyboard(476);

    screenSize.resize(DESKTOP);
    expect(followed(dialog)).toEqual(NOT_FOLLOWED);
    keyboard.closeKeyboard();
    expect(followed(dialog)).toEqual(NOT_FOLLOWED);

    screenSize.resize(PHONE);
    expect(followed(dialog)).toEqual({ top: '0px', height: '812px' });
  });

  it('stays the size of the window where the browser has no visual viewport', async () => {
    viewport(PHONE);
    render(<FormDialog />);
    expect(followed(await screen.findByRole('dialog'))).toEqual(NOT_FOLLOWED);
  });
});

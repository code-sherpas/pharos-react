import { afterEach, describe, it, expect, vi } from 'vitest';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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
 * jsdom has no `matchMedia`, so the viewport is a double: it answers whether
 * the window is narrower than the query's `min-width`, and tells listeners
 * when the width crosses it.
 */
function viewport(initialWidthInRem: number) {
  let width = initialWidthInRem;
  const queries: string[] = [];
  const listeners = new Set<() => void>();
  function matchesAt(media: string): boolean {
    const minWidth = /min-width:\s*([\d.]+)rem/.exec(media);
    if (minWidth === null) return false;
    const atLeast = width >= Number(minWidth[1]);
    return media.startsWith('not all and') ? !atLeast : atLeast;
  }
  vi.stubGlobal(
    'matchMedia',
    vi.fn(function matchMedia(media: string) {
      queries.push(media);
      return {
        media,
        get matches() {
          return matchesAt(media);
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
    resize(nextWidthInRem: number) {
      width = nextWidthInRem;
      act(function notify() {
        for (const listener of listeners) listener();
      });
    },
  };
}

/** A phone (375px) and a desktop (1280px), in rem at the default 16px. */
const PHONE = 375 / 16;
const DESKTOP = 1280 / 16;

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
    expect(screenSize.queries).toContain(`not all and (min-width: ${tokens.breakpoint.compact})`);
  });

  it('is centered exactly at the breakpoint', async () => {
    viewport(Number.parseFloat(tokens.breakpoint.compact));
    render(<FormDialog />);
    expect(await screen.findByRole('dialog')).toHaveAttribute('data-pharos-mode', 'centered');
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

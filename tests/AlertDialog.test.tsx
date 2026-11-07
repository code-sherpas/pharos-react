import { describe, it, expect, vi } from 'vitest';
import { useRef, useState } from 'react';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Dialog, DialogContent, DialogTitle } from '../src/components/Dialog';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from '../src/components/AlertDialog';

interface ConfirmDeleteProps {
  onDelete?: () => void;
  onOpenChange?: (open: boolean) => void;
}

/** A destructive confirmation, the shape most consumers will write. */
function ConfirmDelete({ onDelete, onOpenChange }: ConfirmDeleteProps) {
  return (
    <AlertDialog onOpenChange={onOpenChange}>
      <AlertDialogTrigger>Delete project</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete project?</AlertDialogTitle>
          <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction intent="destructive" onClick={onDelete}>
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

async function openConfirmDelete(props: ConfirmDeleteProps = {}) {
  const user = userEvent.setup();
  render(<ConfirmDelete {...props} />);
  await user.click(screen.getByRole('button', { name: 'Delete project' }));
  const dialog = await screen.findByRole('alertdialog');
  return { user, dialog };
}

/** The backdrop Base UI renders next to the panel, inside the same portal. */
function backdropOf(dialog: HTMLElement): HTMLElement {
  const backdrop = dialog.parentElement?.querySelector<HTMLElement>(
    ':scope > [role="presentation"]',
  );
  if (!backdrop) throw new Error('No backdrop next to the alert dialog');
  return backdrop;
}

describe('AlertDialog', () => {
  it('stays closed until its trigger is pressed', () => {
    render(<ConfirmDelete />);
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });

  it('is a modal alertdialog named by its title and described by its description', async () => {
    const { dialog } = await openConfirmDelete();

    expect(dialog).toHaveAccessibleName('Delete project?');
    expect(dialog).toHaveAccessibleDescription('This cannot be undone.');
    // Modal: Base UI hides everything outside the panel from assistive tech,
    // so the trigger behind it is no longer in the accessibility tree.
    expect(screen.queryByRole('button', { name: 'Delete project' })).not.toBeInTheDocument();
    expect(dialog).toHaveAttribute('data-pharos-slot', 'alert-dialog-content');
  });

  it('starts with focus on Cancel, even when Cancel is not the first button', async () => {
    const user = userEvent.setup();
    render(
      <AlertDialog>
        <AlertDialogTrigger>Publish</AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogTitle>Publish course?</AlertDialogTitle>
          <AlertDialogFooter>
            <AlertDialogAction>Publish</AlertDialogAction>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>,
    );

    await user.click(screen.getByRole('button', { name: 'Publish' }));

    await waitFor(() => expect(screen.getByRole('button', { name: 'Cancel' })).toHaveFocus());
  });

  it('pressing Enter right after it opens cancels instead of confirming', async () => {
    const onDelete = vi.fn();
    const { user } = await openConfirmDelete({ onDelete });
    await waitFor(() => expect(screen.getByRole('button', { name: 'Cancel' })).toHaveFocus());

    await user.keyboard('{Enter}');

    await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
    expect(onDelete).not.toHaveBeenCalled();
  });

  it('moves the initial focus wherever initialFocus points', async () => {
    function TypeToConfirm() {
      const inputRef = useRef<HTMLInputElement>(null);
      return (
        <AlertDialog defaultOpen>
          <AlertDialogContent initialFocus={inputRef}>
            <AlertDialogTitle>Delete organization?</AlertDialogTitle>
            <label>
              Organization name
              <input ref={inputRef} />
            </label>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction intent="destructive">Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      );
    }
    render(<TypeToConfirm />);

    await waitFor(() => expect(screen.getByLabelText('Organization name')).toHaveFocus());
  });

  it('ignores a click outside: it neither closes nor confirms', async () => {
    const onDelete = vi.fn();
    const onOpenChange = vi.fn();
    const { user, dialog } = await openConfirmDelete({ onDelete, onOpenChange });
    onOpenChange.mockClear();

    // The backdrop is where an outside click lands on a modal: a click there
    // is what closes a Dialog.
    await user.click(backdropOf(dialog));

    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    expect(onOpenChange).not.toHaveBeenCalled();
    expect(onDelete).not.toHaveBeenCalled();
  });

  it('closes on Escape without confirming, and returns focus to the trigger', async () => {
    const onDelete = vi.fn();
    const onOpenChange = vi.fn();
    const { user } = await openConfirmDelete({ onDelete, onOpenChange });

    await user.keyboard('{Escape}');

    await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
    expect(onOpenChange).toHaveBeenLastCalledWith(false, expect.anything());
    expect(onDelete).not.toHaveBeenCalled();
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Delete project' })).toHaveFocus(),
    );
  });

  it('closes on Cancel without confirming, and returns focus to the trigger', async () => {
    const onDelete = vi.fn();
    const onOpenChange = vi.fn();
    const { user } = await openConfirmDelete({ onDelete, onOpenChange });

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
    expect(onOpenChange).toHaveBeenLastCalledWith(false, expect.anything());
    expect(onDelete).not.toHaveBeenCalled();
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Delete project' })).toHaveFocus(),
    );
  });

  it('confirms and closes on Action', async () => {
    const onDelete = vi.fn();
    const { user } = await openConfirmDelete({ onDelete });

    await user.click(screen.getByRole('button', { name: 'Delete' }));

    expect(onDelete).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
  });

  it('renders Action and Cancel as Buttons with their intents', async () => {
    await openConfirmDelete();

    const action = screen.getByRole('button', { name: 'Delete' });
    const cancel = screen.getByRole('button', { name: 'Cancel' });
    expect(action).toHaveAttribute('data-pharos-intent', 'destructive');
    expect(action).toHaveAttribute('data-pharos-slot', 'alert-dialog-action');
    expect(cancel).toHaveAttribute('data-pharos-intent', 'secondary');
    expect(cancel).toHaveAttribute('data-pharos-slot', 'alert-dialog-cancel');
  });

  it('defaults Action to the primary intent, for confirmations that destroy nothing', async () => {
    render(
      <AlertDialog defaultOpen>
        <AlertDialogContent>
          <AlertDialogTitle>Publish course?</AlertDialogTitle>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction>Publish</AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>,
    );

    expect(await screen.findByRole('button', { name: 'Publish' })).toHaveAttribute(
      'data-pharos-intent',
      'primary',
    );
  });

  it('still hands the Cancel button to a consumer ref', async () => {
    let cancelNode: HTMLButtonElement | null = null;
    function captureCancel(node: HTMLButtonElement | null) {
      cancelNode = node;
    }
    render(
      <AlertDialog defaultOpen>
        <AlertDialogContent>
          <AlertDialogTitle>Leave?</AlertDialogTitle>
          <AlertDialogCancel ref={captureCancel}>Stay</AlertDialogCancel>
        </AlertDialogContent>
      </AlertDialog>,
    );

    const stay = await screen.findByRole('button', { name: 'Stay' });
    expect(cancelNode).toBe(stay);
    await waitFor(() => expect(stay).toHaveFocus());
  });

  it('works controlled, opened from outside any trigger', async () => {
    const user = userEvent.setup();
    function Controlled() {
      const [open, setOpen] = useState(false);
      return (
        <>
          <button type="button" onClick={() => setOpen(true)}>
            Remove member
          </button>
          <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogContent>
              <AlertDialogTitle>Remove member?</AlertDialogTitle>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction intent="destructive">Remove</AlertDialogAction>
            </AlertDialogContent>
          </AlertDialog>
        </>
      );
    }
    render(<Controlled />);

    await user.click(screen.getByRole('button', { name: 'Remove member' }));
    expect(await screen.findByRole('alertdialog', { name: 'Remove member?' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Remove' }));
    await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
  });

  describe('while the confirmed operation is in progress', () => {
    /**
     * A removal that fails or succeeds when the test says so: the asynchronous
     * pattern a consumer writes, with the progress and the error composed
     * inside the content.
     */
    function AsyncRemoval({
      remove,
      onCancel,
    }: {
      remove: () => Promise<boolean>;
      onCancel?: () => void;
    }) {
      const [open, setOpen] = useState(false);
      const [pending, setPending] = useState(false);
      const [failed, setFailed] = useState(false);

      async function confirmRemoval(event: { preventDefault: () => void }) {
        event.preventDefault();
        setFailed(false);
        setPending(true);
        const removed = await remove();
        setPending(false);
        if (removed) setOpen(false);
        else setFailed(true);
      }

      return (
        <AlertDialog open={open} onOpenChange={setOpen} pending={pending}>
          <AlertDialogTrigger>Remove member</AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remove member?</AlertDialogTitle>
              <div role="status">{pending ? 'Removing member…' : ''}</div>
              <div role="alert">{failed ? 'The member could not be removed.' : ''}</div>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={onCancel}>Cancel</AlertDialogCancel>
              <AlertDialogAction intent="destructive" onClick={confirmRemoval}>
                {failed ? 'Retry' : 'Remove'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      );
    }

    /** A removal the test settles by hand, so it can look at the pending state. */
    function deferredRemoval() {
      const settlers: ((removed: boolean) => void)[] = [];
      const remove = vi.fn(function startRemoval() {
        return new Promise<boolean>(function holdUntilSettled(resolve) {
          settlers.push(resolve);
        });
      });
      function settle(removed: boolean) {
        const next = settlers.shift();
        if (!next) throw new Error('No removal in progress');
        next(removed);
      }
      return { remove, settle };
    }

    async function startRemoval(onCancel?: () => void) {
      const user = userEvent.setup();
      const { remove, settle } = deferredRemoval();
      render(<AsyncRemoval remove={remove} onCancel={onCancel} />);
      await user.click(screen.getByRole('button', { name: 'Remove member' }));
      const dialog = await screen.findByRole('alertdialog');
      await user.click(screen.getByRole('button', { name: 'Remove' }));
      return { user, dialog, remove, settle };
    }

    it('stays open when Action calls preventDefault', async () => {
      const onOpenChange = vi.fn();
      const user = userEvent.setup();
      render(
        <AlertDialog defaultOpen onOpenChange={onOpenChange}>
          <AlertDialogContent>
            <AlertDialogTitle>Delete project?</AlertDialogTitle>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={function keepOpen(event) {
                event.preventDefault();
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogContent>
        </AlertDialog>,
      );

      await user.click(await screen.findByRole('button', { name: 'Delete' }));

      expect(screen.getByRole('alertdialog')).toBeInTheDocument();
      expect(onOpenChange).not.toHaveBeenCalled();
    });

    it('marks the panel busy and Action aria-disabled, still focusable, with a hidden Spinner', async () => {
      const { dialog } = await startRemoval();
      const action = screen.getByRole('button', { name: 'Remove' });

      expect(dialog).toHaveAttribute('aria-busy', 'true');
      expect(action).toHaveAttribute('aria-disabled', 'true');
      expect(action).not.toBeDisabled();
      expect(action).toHaveFocus();
      // The Spinner is there for the eye only: its own "Loading…" is hidden, so
      // the only progress a screen reader hears is the consumer's message.
      const spinner = action.querySelector('[role="status"]');
      expect(spinner).toHaveAttribute('aria-hidden', 'true');
      expect(action).toHaveAccessibleName('Remove');
      expect(screen.getByRole('status')).toHaveTextContent('Removing member…');
    });

    it("does not close on Escape, Cancel or a click outside, nor run Cancel's onClick", async () => {
      const onCancel = vi.fn();
      const { user, dialog } = await startRemoval(onCancel);
      const cancel = screen.getByRole('button', { name: 'Cancel' });
      expect(cancel).toHaveAttribute('aria-disabled', 'true');

      await user.keyboard('{Escape}');
      await user.click(cancel);
      await user.click(backdropOf(dialog));

      expect(screen.getByRole('alertdialog')).toBeInTheDocument();
      expect(onCancel).not.toHaveBeenCalled();
    });

    it('keeps Escape from closing the layer behind it either', async () => {
      const user = userEvent.setup();
      render(
        <Dialog defaultOpen>
          <DialogContent>
            <DialogTitle>Project settings</DialogTitle>
            <AlertDialog defaultOpen pending>
              <AlertDialogContent>
                <AlertDialogTitle>Delete project?</AlertDialogTitle>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction intent="destructive">Delete</AlertDialogAction>
              </AlertDialogContent>
            </AlertDialog>
          </DialogContent>
        </Dialog>,
      );
      await screen.findByRole('alertdialog');

      await user.keyboard('{Escape}');

      expect(screen.getByRole('alertdialog', { name: 'Delete project?' })).toBeInTheDocument();
      expect(screen.getByText('Project settings')).toBeInTheDocument();
    });

    it('ignores further presses on Action, so the operation does not start twice', async () => {
      const { user, remove } = await startRemoval();

      await user.click(screen.getByRole('button', { name: 'Remove' }));
      await user.keyboard('{Enter}');

      expect(remove).toHaveBeenCalledTimes(1);
    });

    it('closes when the operation ends and returns focus to the trigger', async () => {
      const { settle } = await startRemoval();

      await act(async function finishRemoval() {
        settle(true);
      });

      await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
      await waitFor(() =>
        expect(screen.getByRole('button', { name: 'Remove member' })).toHaveFocus(),
      );
    });

    it('stays open with the error when the operation fails, and Retry runs it again', async () => {
      const { user, dialog, remove, settle } = await startRemoval();

      await act(async function failRemoval() {
        settle(false);
      });

      expect(screen.getByRole('alert')).toHaveTextContent('The member could not be removed.');
      expect(dialog).not.toHaveAttribute('aria-busy');
      const retry = screen.getByRole('button', { name: 'Retry' });
      expect(retry).not.toHaveAttribute('aria-disabled');
      expect(retry).toHaveFocus();

      await user.click(retry);
      expect(remove).toHaveBeenCalledTimes(2);
      expect(dialog).toHaveAttribute('aria-busy', 'true');
      await act(async function finishRemoval() {
        settle(true);
      });

      await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
    });

    it('leaves a confirmation without pending exactly as before', async () => {
      const { dialog } = await openConfirmDelete();

      expect(dialog).not.toHaveAttribute('aria-busy');
      expect(screen.getByRole('button', { name: 'Delete' })).not.toHaveAttribute('aria-disabled');
      expect(screen.getByRole('button', { name: 'Cancel' })).not.toHaveAttribute('aria-disabled');
    });
  });
});

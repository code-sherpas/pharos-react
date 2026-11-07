import { describe, it, expect, vi } from 'vitest';
import { useRef, useState } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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
    const { user } = await openConfirmDelete({ onDelete, onOpenChange });
    onOpenChange.mockClear();

    await user.click(document.body);

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
});

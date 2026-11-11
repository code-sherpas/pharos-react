import { useRef, useState, type MouseEvent } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
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
} from './AlertDialog';
import { Button } from './Button';

/**
 * `AlertDialog` asks for explicit permission before an action. It wraps Base
 * UI's `AlertDialog` (ARIA APG **alertdialog**): `role="alertdialog"` named by
 * its title and described by its description, focus starts on Cancel, Escape
 * equals Cancel, a click outside does nothing, and Action confirms and closes.
 * Same look as `Dialog`. Use it for every confirmation, destructive or not.
 *
 * For an operation that takes time, call `event.preventDefault()` in Action's
 * `onClick` and set `pending` until it ends (see the `Async` and
 * `AsyncWithRetry` stories). Pharos adds no text: the progress message and
 * the error are composed inside the content, in `role="status"` and
 * `role="alert"` regions that exist before their text arrives.
 */
const meta: Meta<typeof AlertDialog> = {
  title: 'Components/AlertDialog',
  component: AlertDialog,
};

export default meta;
type Story = StoryObj<typeof meta>;

/** Interactive destructive confirmation: focus lands on Cancel when it opens. */
export const Destructive: Story = {
  render: () => (
    <AlertDialog>
      <AlertDialogTrigger render={<Button intent="destructive">Delete project</Button>} />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete project?</AlertDialogTitle>
          <AlertDialogDescription>
            This permanently removes the project and all of its data.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction intent="destructive">Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),
};

/** A confirmation that destroys nothing: the action keeps the primary intent. */
export const NonDestructive: Story = {
  render: () => (
    <AlertDialog>
      <AlertDialogTrigger render={<Button>Publish course</Button>} />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Publish course?</AlertDialogTitle>
          <AlertDialogDescription>
            Enrolled students will see it on their dashboard straight away.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction>Publish</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),
};

/** `defaultOpen` so Chromatic captures the panel, the backdrop and the focused Cancel. */
export const Open: Story = {
  render: () => (
    <AlertDialog defaultOpen>
      <AlertDialogTrigger render={<Button intent="destructive">Delete project</Button>} />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete project?</AlertDialogTitle>
          <AlertDialogDescription>
            This permanently removes the project and all of its data.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction intent="destructive">Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),
};

/**
 * Actions that say what they do, at 320px (what 1280px at 400% zoom leaves):
 * they do not fit side by side, so the footer wraps them onto two rows, at the
 * end and in reading order, and a label wider than a row wraps inside its
 * Button. Nothing runs off the edge. Shared by Dialog and Sheet.
 */
export const LongActionsNarrow: Story = {
  render: () => (
    <AlertDialog defaultOpen>
      <AlertDialogTrigger render={<Button>Leave the assessment</Button>} />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Leave without saving your answer?</AlertDialogTitle>
          <AlertDialogDescription>
            The level you marked for «Customer care skills» is not saved yet.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep answering</AlertDialogCancel>
          <AlertDialogAction intent="destructive">
            Leave without saving the answer you have just marked
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),
  parameters: { chromatic: { viewports: [320] } },
};

/** Waits `ms`, standing in for a request; resolves to whether it succeeded. */
function simulateRequest(ms: number, succeeds: boolean): Promise<boolean> {
  return new Promise(function settleLater(resolve) {
    setTimeout(resolve, ms, succeeds);
  });
}

/**
 * The confirmation of an operation that takes time, the way a consumer writes
 * it. `failFirst` makes the first attempt fail, to show the error and Retry.
 */
function AsyncDelete({ failFirst = false }: { failFirst?: boolean }) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [failed, setFailed] = useState(false);
  const attempts = useRef(0);

  function openChange(next: boolean) {
    setOpen(next);
    if (next) setFailed(false);
  }

  async function confirmDelete(event: MouseEvent) {
    // Keep it open: it closes once the deletion has finished.
    event.preventDefault();
    attempts.current += 1;
    setFailed(false);
    setPending(true);
    const deleted = await simulateRequest(1500, !(failFirst && attempts.current === 1));
    setPending(false);
    if (deleted) setOpen(false);
    else setFailed(true);
  }

  return (
    <AlertDialog open={open} onOpenChange={openChange} pending={pending}>
      <AlertDialogTrigger render={<Button intent="destructive">Delete project</Button>} />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete project?</AlertDialogTitle>
          <AlertDialogDescription>
            This permanently removes the project and all of its data.
          </AlertDialogDescription>
          {/* Both regions are always there, so their text is announced when it arrives. */}
          <div role="status">{pending ? 'Deleting the project…' : ''}</div>
          <div role="alert" style={{ color: 'var(--pharos-color-semantic-error-fg)' }}>
            {failed ? 'The project could not be deleted. Check your connection and retry.' : ''}
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction intent="destructive" onClick={confirmDelete}>
            {failed ? 'Retry' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

/**
 * The asynchronous pattern: Action calls `preventDefault()` and sets
 * `pending`; while it is set, Escape and Cancel do nothing, Action is
 * `aria-disabled` with a Spinner, and the status region says what is going on.
 * It closes when the deletion ends, and focus returns to the trigger.
 */
export const Async: Story = {
  render: () => <AsyncDelete />,
};

/**
 * The first attempt fails: the error is read out from a `role="alert"` region,
 * the confirmation stays open, and Action, now "Retry", runs it again.
 */
export const AsyncWithRetry: Story = {
  render: () => <AsyncDelete failFirst />,
};

/** `pending` held on, so Chromatic captures the busy panel and Action's Spinner. */
export const Pending: Story = {
  render: () => (
    <AlertDialog defaultOpen pending>
      <AlertDialogTrigger render={<Button intent="destructive">Delete project</Button>} />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete project?</AlertDialogTitle>
          <AlertDialogDescription>
            This permanently removes the project and all of its data.
          </AlertDialogDescription>
          <div role="status">Deleting the project…</div>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction intent="destructive">Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),
};

import { useEffect, useRef } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from './Button';
import { ToastProvider, Toaster, useToast, type ToasterPosition, type ToastOptions } from './Toast';

/**
 * `Toast` is brief feedback about something that just happened, shown in a
 * corner and gone on its own. `ToastProvider` holds the toasts, one `Toaster`
 * renders them, and `useToast()` raises them from anywhere inside. The region
 * is a live region from the start, F6 moves focus into it, and its timer
 * pauses while the pointer or focus is on it. The consumer names the region
 * and the close button.
 *
 * Use it for feedback that can be missed. What must be acted on is a `Dialog`;
 * an error about a field goes next to the field.
 */
const meta: Meta<typeof Toaster> = {
  title: 'Components/Toast',
  component: Toaster,
};

export default meta;
type Story = StoryObj<typeof meta>;

/** Raises the given toasts once, when the story mounts, and keeps them. */
function RaisedOnMount({ toasts }: { toasts: ToastOptions[] }) {
  const { add } = useToast();
  const raised = useRef(false);
  useEffect(() => {
    if (raised.current) return;
    raised.current = true;
    toasts.forEach((toast) => add({ timeout: 0, ...toast }));
  }, [add, toasts]);
  return null;
}

function Stage({
  toasts,
  position = 'bottom-end',
}: {
  toasts: ToastOptions[];
  position?: ToasterPosition;
}) {
  return (
    <ToastProvider limit={5}>
      <RaisedOnMount toasts={toasts} />
      <Toaster position={position} label="Notifications" closeLabel="Close" />
    </ToastProvider>
  );
}

/** The everyday use: a button whose result is confirmed by a toast. */
export const Default: Story = {
  render: function DefaultStory() {
    function SaveButton() {
      const { add } = useToast();
      return (
        <Button onClick={() => add({ title: 'Settings saved', variant: 'success' })}>
          Save changes
        </Button>
      );
    }
    return (
      <ToastProvider>
        <SaveButton />
        <Toaster label="Notifications" closeLabel="Close" />
      </ToastProvider>
    );
  },
};

/** Every variant. All but `default` carry an icon, so colour is never alone. */
export const Variants: Story = {
  render: () => (
    <Stage
      toasts={[
        { title: 'Link copied' },
        { title: 'Settings saved', variant: 'success' },
        { title: 'A new version is available', variant: 'info' },
        { title: 'Your session ends in 5 minutes', variant: 'warning' },
        { title: 'Couldn’t send the invitation', variant: 'destructive' },
      ]}
    />
  ),
};

/** With a description and an action. A toast with an action stays until closed. */
export const WithAction: Story = {
  render: () => (
    <Stage
      toasts={[
        {
          title: 'Message deleted',
          description: 'It is gone from the conversation for everyone.',
          action: { children: 'Undo' },
        },
      ]}
    />
  ),
};

/** The longest content wraps inside the toast; nothing is cut. */
export const LongContent: Story = {
  render: () => (
    <Stage
      position="top-center"
      toasts={[
        {
          title: 'We couldn’t save whether a raised hand plays a sound in this lesson',
          description:
            'Check your connection and try again. If it keeps happening, reload the page — your other settings are safe.',
          variant: 'destructive',
          action: { children: 'Try again' },
        },
      ]}
    />
  ),
};

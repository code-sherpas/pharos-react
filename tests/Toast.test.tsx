import { describe, it, expect, vi, afterEach } from 'vitest';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ToastProvider, Toaster, useToast, type ToastOptions } from '../src/components/Toast';

/** A page with one button that raises the toast it is given. */
function Page({ toast }: { toast: ToastOptions }) {
  const { add } = useToast();
  return (
    <button type="button" onClick={() => add(toast)}>
      Raise
    </button>
  );
}

function renderWith(toast: ToastOptions, provider: { timeout?: number } = {}) {
  return render(
    <ToastProvider {...provider}>
      <Page toast={toast} />
      <Toaster position="top-center" label="Notifications" closeLabel="Close" />
    </ToastProvider>,
  );
}

afterEach(() => {
  vi.useRealTimers();
});

describe('Toast', () => {
  it('shows the toast inside a region named by the consumer, before and after it arrives', async () => {
    const user = userEvent.setup();
    renderWith({ title: 'Settings saved', description: 'Your profile is up to date.' });

    // The region exists before any toast, so what arrives in it is announced.
    const region = screen.getByRole('region', { name: 'Notifications' });
    expect(region).toHaveAttribute('aria-live', 'polite');
    expect(region).toHaveAttribute('data-pharos-position', 'top-center');

    await user.click(screen.getByRole('button', { name: 'Raise' }));

    const toast = await screen.findByRole('dialog', { name: 'Settings saved' });
    expect(region).toContainElement(toast);
    expect(toast).toHaveAccessibleDescription('Your profile is up to date.');
  });

  it('marks what the toast is about, with an icon for every variant but default', async () => {
    const user = userEvent.setup();
    renderWith({ title: 'Couldn’t send it', variant: 'destructive' });

    await user.click(screen.getByRole('button', { name: 'Raise' }));

    const toast = await screen.findByRole('dialog', { name: 'Couldn’t send it' });
    expect(toast).toHaveAttribute('data-pharos-variant', 'destructive');
    expect(toast.querySelector('svg[aria-hidden="true"]')).not.toBeNull();
  });

  it('carries no icon when it is a plain message', async () => {
    const user = userEvent.setup();
    renderWith({ title: 'Link copied' });

    await user.click(screen.getByRole('button', { name: 'Raise' }));

    const toast = await screen.findByRole('dialog', { name: 'Link copied' });
    expect(toast).toHaveAttribute('data-pharos-variant', 'default');
    // Only the close button's X remains.
    expect(toast.querySelectorAll('svg')).toHaveLength(1);
  });

  it('closes with its close button, named by the consumer', async () => {
    const user = userEvent.setup();
    renderWith({ title: 'Settings saved' });

    await user.click(screen.getByRole('button', { name: 'Raise' }));
    await screen.findByRole('dialog', { name: 'Settings saved' });
    // The close button is hidden from assistive technology until the pointer
    // or focus reaches the toasts — then it is there, by its name.
    await user.hover(screen.getByRole('region', { name: 'Notifications' }));
    await user.click(screen.getByRole('button', { name: 'Close' }));

    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'Settings saved' })).not.toBeInTheDocument();
    });
  });

  it('goes away on its own once the provider’s timeout has passed', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderWith({ title: 'Settings saved' }, { timeout: 1000 });

    await user.click(screen.getByRole('button', { name: 'Raise' }));
    await screen.findByRole('dialog', { name: 'Settings saved' });
    // Move the pointer off the toasts: hovering them pauses the timer.
    await user.unhover(screen.getByRole('region', { name: 'Notifications' }));
    act(() => {
      vi.advanceTimersByTime(1500);
    });

    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'Settings saved' })).not.toBeInTheDocument();
    });
  });

  it('stays until acted on when it carries an action, and the action closes it', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const undo = vi.fn();
    renderWith(
      { title: 'Message deleted', action: { children: 'Undo', onClick: undo } },
      { timeout: 1000 },
    );

    await user.click(screen.getByRole('button', { name: 'Raise' }));
    await screen.findByRole('dialog', { name: 'Message deleted' });
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(screen.getByRole('dialog', { name: 'Message deleted' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Undo' }));

    expect(undo).toHaveBeenCalledTimes(1);
    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'Message deleted' })).not.toBeInTheDocument();
    });
  });

  it('hands out the same functions across renders, so they can sit in an effect’s deps', async () => {
    const user = userEvent.setup();
    const seen = new Set<unknown>();
    function Watcher() {
      const toast = useToast();
      seen.add(toast);
      return null;
    }
    render(
      <ToastProvider>
        <Watcher />
        <Page toast={{ title: 'Settings saved' }} />
        <Toaster label="Notifications" closeLabel="Close" />
      </ToastProvider>,
    );

    await user.click(screen.getByRole('button', { name: 'Raise' }));
    await screen.findByRole('dialog', { name: 'Settings saved' });

    expect(seen.size).toBe(1);
  });

  it('sits as far from its edge as the consumer says, in pixels or any CSS length', () => {
    const { rerender } = render(
      <ToastProvider>
        <Toaster label="Notifications" closeLabel="Close" offset={72} />
      </ToastProvider>,
    );
    const region = screen.getByRole('region', { name: 'Notifications' });
    expect(region.style.getPropertyValue('--pharos-toast-offset')).toBe('72px');

    rerender(
      <ToastProvider>
        <Toaster label="Notifications" closeLabel="Close" offset="var(--bars-bottom)" />
      </ToastProvider>,
    );
    expect(region.style.getPropertyValue('--pharos-toast-offset')).toBe('var(--bars-bottom)');
  });

  it('replaces a toast raised again with the same id instead of stacking it', async () => {
    const user = userEvent.setup();
    renderWith({ id: 'saved', title: 'Settings saved' });

    await user.click(screen.getByRole('button', { name: 'Raise' }));
    await user.click(screen.getByRole('button', { name: 'Raise' }));

    await screen.findByRole('dialog', { name: 'Settings saved' });
    expect(screen.getAllByRole('dialog', { name: 'Settings saved' })).toHaveLength(1);
  });
});

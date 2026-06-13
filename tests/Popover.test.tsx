import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverTitle,
  PopoverDescription,
  PopoverClose,
} from '../src/components/Popover';

/**
 * A minimal popover reused across tests: a trigger plus a titled panel with
 * a description and an explicit close button. Asserts the disclosure/dialog
 * contract — deliberately the opposite of the DropdownMenu's menu-button
 * contract (no `role="menu"`/`menuitem`, no roving focus).
 */
function renderPopover() {
  return render(
    <Popover>
      <PopoverTrigger>Account</PopoverTrigger>
      <PopoverContent>
        <PopoverTitle>Signed in as Ada</PopoverTitle>
        <PopoverDescription>ada@example.com</PopoverDescription>
        <PopoverClose>Sign out</PopoverClose>
      </PopoverContent>
    </Popover>,
  );
}

describe('Popover', () => {
  it('renders the trigger as a button and keeps the popover closed initially', () => {
    renderPopover();
    expect(screen.getByRole('button', { name: 'Account' })).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('opens on trigger click and exposes the dialog role — not a menu', async () => {
    const user = userEvent.setup();
    renderPopover();

    await user.click(screen.getByRole('button', { name: 'Account' }));

    // The disclosure/dialog contract: the popup is a dialog, NOT a menu, and
    // its content is not turned into menuitems (the inverse of DropdownMenu).
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(screen.queryByRole('menuitem')).not.toBeInTheDocument();
  });

  it('labels the dialog via the title (aria-labelledby) and describes it', async () => {
    const user = userEvent.setup();
    renderPopover();

    await user.click(screen.getByRole('button', { name: 'Account' }));

    // PopoverTitle wires aria-labelledby, so the dialog has an accessible name.
    expect(await screen.findByRole('dialog', { name: 'Signed in as Ada' })).toBeInTheDocument();
  });

  it('marks the trigger expanded state via aria-expanded', async () => {
    const user = userEvent.setup();
    renderPopover();
    const trigger = screen.getByRole('button', { name: 'Account' });

    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await user.click(trigger);
    await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'true'));
  });

  it('closes via the PopoverClose button', async () => {
    const user = userEvent.setup();
    renderPopover();

    await user.click(screen.getByRole('button', { name: 'Account' }));
    expect(await screen.findByRole('dialog')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Sign out' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('closes on Escape and returns focus to the trigger', async () => {
    const user = userEvent.setup();
    renderPopover();
    const trigger = screen.getByRole('button', { name: 'Account' });

    await user.click(trigger);
    expect(await screen.findByRole('dialog')).toBeInTheDocument();

    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(trigger).toHaveFocus();
  });

  it('is non-modal: an outside click dismisses it', async () => {
    const user = userEvent.setup();
    render(
      <div>
        <button type="button">Outside</button>
        <Popover>
          <PopoverTrigger>Account</PopoverTrigger>
          <PopoverContent>
            <PopoverTitle>Panel</PopoverTitle>
          </PopoverContent>
        </Popover>
      </div>,
    );

    await user.click(screen.getByRole('button', { name: 'Account' }));
    expect(await screen.findByRole('dialog')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Outside' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('composes the trigger as a custom element via render', async () => {
    const user = userEvent.setup();
    render(
      <Popover>
        <PopoverTrigger
          render={<button type="button" data-testid="avatar-btn" aria-label="Open account" />}
        />
        <PopoverContent>
          <PopoverTitle>Account</PopoverTitle>
        </PopoverContent>
      </Popover>,
    );

    const trigger = screen.getByTestId('avatar-btn');
    expect(trigger).toHaveAttribute('aria-label', 'Open account');
    await user.click(trigger);
    expect(await screen.findByRole('dialog', { name: 'Account' })).toBeInTheDocument();
  });

  it('tags the content surface via data-pharos-slot', async () => {
    const user = userEvent.setup();
    renderPopover();

    await user.click(screen.getByRole('button', { name: 'Account' }));

    expect(await screen.findByRole('dialog')).toHaveAttribute(
      'data-pharos-slot',
      'popover-content',
    );
  });
});

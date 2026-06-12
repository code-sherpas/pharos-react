import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuGroup,
} from '../src/components/DropdownMenu';

/**
 * A minimal menu reused across tests: a trigger plus two safe actions
 * and one destructive action separated from them.
 */
function renderMenu(props: {
  onRename?: () => void;
  onDelete?: () => void;
  deleteDisabled?: boolean;
}) {
  return render(
    <DropdownMenu>
      <DropdownMenuTrigger>Options</DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={props.onRename}>Rename</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          disabled={props.deleteDisabled}
          onClick={props.onDelete}
        >
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>,
  );
}

describe('DropdownMenu', () => {
  it('renders the trigger as a button and keeps the menu closed initially', () => {
    renderMenu({});
    expect(screen.getByRole('button', { name: 'Options' })).toBeInTheDocument();
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('opens the menu on trigger click and exposes menu/menuitem roles', async () => {
    const user = userEvent.setup();
    renderMenu({});

    await user.click(screen.getByRole('button', { name: 'Options' }));

    expect(await screen.findByRole('menu')).toBeInTheDocument();
    // The menu-button ARIA contract: items carry role="menuitem".
    expect(screen.getByRole('menuitem', { name: 'Rename' })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Delete' })).toBeInTheDocument();
  });

  it('marks the trigger expanded state via aria-expanded', async () => {
    const user = userEvent.setup();
    renderMenu({});
    const trigger = screen.getByRole('button', { name: 'Options' });

    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await user.click(trigger);
    await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'true'));
  });

  it('fires the item handler and closes the menu on selection', async () => {
    const user = userEvent.setup();
    const onRename = vi.fn();
    renderMenu({ onRename });

    await user.click(screen.getByRole('button', { name: 'Options' }));
    await user.click(await screen.findByRole('menuitem', { name: 'Rename' }));

    expect(onRename).toHaveBeenCalledTimes(1);
    // closeOnClick defaults to true — the menu is gone after selecting.
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('closes on Escape and returns focus to the trigger', async () => {
    const user = userEvent.setup();
    renderMenu({});
    const trigger = screen.getByRole('button', { name: 'Options' });

    await user.click(trigger);
    expect(await screen.findByRole('menu')).toBeInTheDocument();

    await user.keyboard('{Escape}');
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it('does not fire the handler for a disabled item', async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();
    renderMenu({ onDelete, deleteDisabled: true });

    await user.click(screen.getByRole('button', { name: 'Options' }));
    const deleteItem = await screen.findByRole('menuitem', { name: 'Delete' });
    await user.click(deleteItem);

    expect(onDelete).not.toHaveBeenCalled();
  });

  it('tags the destructive item via data-pharos-variant', async () => {
    const user = userEvent.setup();
    renderMenu({});

    await user.click(screen.getByRole('button', { name: 'Options' }));

    expect(await screen.findByRole('menuitem', { name: 'Rename' })).toHaveAttribute(
      'data-pharos-variant',
      'default',
    );
    expect(screen.getByRole('menuitem', { name: 'Delete' })).toHaveAttribute(
      'data-pharos-variant',
      'destructive',
    );
  });

  it('composes the trigger as a custom element via render', async () => {
    const user = userEvent.setup();
    render(
      <DropdownMenu>
        <DropdownMenuTrigger
          render={<button type="button" data-testid="kebab" aria-label="Row options" />}
        />
        <DropdownMenuContent>
          <DropdownMenuItem>Edit</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );

    const trigger = screen.getByTestId('kebab');
    expect(trigger).toHaveAttribute('aria-label', 'Row options');
    await user.click(trigger);
    expect(await screen.findByRole('menuitem', { name: 'Edit' })).toBeInTheDocument();
  });

  it('renders a group with an accessible label', async () => {
    const user = userEvent.setup();
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Account</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuGroup>
            <DropdownMenuLabel>Session</DropdownMenuLabel>
            <DropdownMenuItem>Log out</DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>,
    );

    await user.click(screen.getByRole('button', { name: 'Account' }));
    expect(await screen.findByRole('group', { name: 'Session' })).toBeInTheDocument();
  });
});

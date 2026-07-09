import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from '../src/components/Sheet';

function renderSheet(side?: 'top' | 'right' | 'bottom' | 'left') {
  return render(
    <Sheet>
      <SheetTrigger>Open</SheetTrigger>
      <SheetContent side={side}>
        <SheetHeader>
          <SheetTitle>Edit profile</SheetTitle>
          <SheetDescription>Update your details.</SheetDescription>
        </SheetHeader>
        <p>Body</p>
        <SheetFooter>
          <SheetClose>Close</SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>,
  );
}

describe('Sheet', () => {
  it('renders the trigger and keeps the sheet closed initially', () => {
    renderSheet();
    expect(screen.getByRole('button', { name: 'Open' })).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('opens on trigger click and exposes a modal dialog labelled by its title', async () => {
    const user = userEvent.setup();
    renderSheet();

    await user.click(screen.getByRole('button', { name: 'Open' }));

    // Labelled by its title via aria-labelledby (Base UI wires it). Modality
    // (focus trap / scroll lock) is a runtime behaviour covered by the e2e
    // harness, not an attribute we assert here.
    expect(await screen.findByRole('dialog', { name: 'Edit profile' })).toBeInTheDocument();
  });

  it('defaults the docked side to right and mirrors it on data-pharos-side', async () => {
    const user = userEvent.setup();
    renderSheet();

    await user.click(screen.getByRole('button', { name: 'Open' }));

    const dialog = await screen.findByRole('dialog');
    expect(dialog).toHaveAttribute('data-pharos-side', 'right');
    expect(dialog).toHaveAttribute('data-pharos-slot', 'sheet-content');
  });

  it('honours the side prop', async () => {
    const user = userEvent.setup();
    renderSheet('left');

    await user.click(screen.getByRole('button', { name: 'Open' }));

    expect(await screen.findByRole('dialog')).toHaveAttribute('data-pharos-side', 'left');
  });

  it('closes via the SheetClose button', async () => {
    const user = userEvent.setup();
    renderSheet();

    await user.click(screen.getByRole('button', { name: 'Open' }));
    expect(await screen.findByRole('dialog')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Close' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('closes on Escape', async () => {
    const user = userEvent.setup();
    renderSheet();

    await user.click(screen.getByRole('button', { name: 'Open' }));
    expect(await screen.findByRole('dialog')).toBeInTheDocument();

    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('composes the trigger as a custom element via render', async () => {
    const user = userEvent.setup();
    render(
      <Sheet>
        <SheetTrigger render={<button type="button" data-testid="menu-btn" aria-label="Menu" />} />
        <SheetContent>
          <SheetTitle>Navigation</SheetTitle>
        </SheetContent>
      </Sheet>,
    );

    const trigger = screen.getByTestId('menu-btn');
    expect(trigger).toHaveAttribute('aria-label', 'Menu');
    await user.click(trigger);
    expect(await screen.findByRole('dialog', { name: 'Navigation' })).toBeInTheDocument();
  });
});

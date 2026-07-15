import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Switch } from '../src/components/Switch';

describe('Switch', () => {
  it('renders a switch, off by default', () => {
    render(<Switch aria-label="Notifications" />);
    const toggle = screen.getByRole('switch', { name: 'Notifications' });
    expect(toggle).toBeInTheDocument();
    expect(toggle).toHaveAttribute('aria-checked', 'false');
  });

  it('toggles checked state on click', async () => {
    const user = userEvent.setup();
    render(<Switch aria-label="Notifications" />);
    const toggle = screen.getByRole('switch', { name: 'Notifications' });

    await user.click(toggle);
    expect(toggle).toHaveAttribute('aria-checked', 'true');
    await user.click(toggle);
    expect(toggle).toHaveAttribute('aria-checked', 'false');
  });

  it('calls onCheckedChange when toggled (controlled)', async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    render(<Switch aria-label="Notifications" checked={false} onCheckedChange={onCheckedChange} />);

    await user.click(screen.getByRole('switch', { name: 'Notifications' }));
    expect(onCheckedChange).toHaveBeenCalledWith(true, expect.anything());
  });

  it('toggles with the Space key', async () => {
    const user = userEvent.setup();
    render(<Switch aria-label="Notifications" />);
    const toggle = screen.getByRole('switch', { name: 'Notifications' });

    toggle.focus();
    await user.keyboard(' ');
    expect(toggle).toHaveAttribute('aria-checked', 'true');
  });

  it('does not toggle when disabled', async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    render(<Switch aria-label="Notifications" disabled onCheckedChange={onCheckedChange} />);

    await user.click(screen.getByRole('switch', { name: 'Notifications' }));
    expect(onCheckedChange).not.toHaveBeenCalled();
  });

  it('associates with a label via htmlFor/id and toggles on label click', async () => {
    const user = userEvent.setup();
    render(
      <label htmlFor="notify">
        <Switch id="notify" />
        Enable notifications
      </label>,
    );
    const toggle = screen.getByRole('switch', { name: 'Enable notifications' });
    await user.click(screen.getByText('Enable notifications'));
    expect(toggle).toHaveAttribute('aria-checked', 'true');
  });

  it('reflects aria-invalid for the error state', () => {
    render(<Switch aria-label="Required toggle" aria-invalid />);
    expect(screen.getByRole('switch', { name: 'Required toggle' })).toHaveAttribute(
      'aria-invalid',
      'true',
    );
  });

  it('tags the control via data-pharos-slot', () => {
    render(<Switch aria-label="Notifications" />);
    expect(screen.getByRole('switch', { name: 'Notifications' })).toHaveAttribute(
      'data-pharos-slot',
      'switch',
    );
  });
});

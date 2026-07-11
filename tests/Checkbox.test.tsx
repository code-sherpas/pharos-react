import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Checkbox } from '../src/components/Checkbox';

describe('Checkbox', () => {
  it('renders a checkbox, unchecked by default', () => {
    render(<Checkbox aria-label="Subscribe" />);
    const box = screen.getByRole('checkbox', { name: 'Subscribe' });
    expect(box).toBeInTheDocument();
    expect(box).toHaveAttribute('aria-checked', 'false');
  });

  it('toggles checked state on click', async () => {
    const user = userEvent.setup();
    render(<Checkbox aria-label="Subscribe" />);
    const box = screen.getByRole('checkbox', { name: 'Subscribe' });

    await user.click(box);
    expect(box).toHaveAttribute('aria-checked', 'true');
    await user.click(box);
    expect(box).toHaveAttribute('aria-checked', 'false');
  });

  it('calls onCheckedChange when toggled (controlled)', async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    render(<Checkbox aria-label="Subscribe" checked={false} onCheckedChange={onCheckedChange} />);

    await user.click(screen.getByRole('checkbox', { name: 'Subscribe' }));
    expect(onCheckedChange).toHaveBeenCalledWith(true, expect.anything());
  });

  it('exposes the indeterminate state as aria-checked="mixed"', () => {
    render(<Checkbox aria-label="Select all" indeterminate />);
    expect(screen.getByRole('checkbox', { name: 'Select all' })).toHaveAttribute(
      'aria-checked',
      'mixed',
    );
  });

  it('does not toggle when disabled', async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    render(<Checkbox aria-label="Subscribe" disabled onCheckedChange={onCheckedChange} />);

    await user.click(screen.getByRole('checkbox', { name: 'Subscribe' }));
    expect(onCheckedChange).not.toHaveBeenCalled();
  });

  it('associates with a label via htmlFor/id and toggles on label click', async () => {
    const user = userEvent.setup();
    render(
      <label htmlFor="terms">
        <Checkbox id="terms" />
        Accept
      </label>,
    );
    const box = screen.getByRole('checkbox', { name: 'Accept' });
    await user.click(screen.getByText('Accept'));
    expect(box).toHaveAttribute('aria-checked', 'true');
  });

  it('tags the control via data-pharos-slot', () => {
    render(<Checkbox aria-label="Subscribe" />);
    expect(screen.getByRole('checkbox', { name: 'Subscribe' })).toHaveAttribute(
      'data-pharos-slot',
      'checkbox',
    );
  });
});

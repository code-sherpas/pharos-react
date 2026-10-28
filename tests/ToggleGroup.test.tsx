import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ToggleGroup, ToggleGroupItem } from '../src/components/ToggleGroup';

function ViewGroup(props: React.ComponentProps<typeof ToggleGroup>) {
  return (
    <ToggleGroup aria-label="View" {...props}>
      <ToggleGroupItem value="list">List</ToggleGroupItem>
      <ToggleGroupItem value="grid">Grid</ToggleGroupItem>
      <ToggleGroupItem value="board">Board</ToggleGroupItem>
    </ToggleGroup>
  );
}

describe('ToggleGroup', () => {
  it('renders a named group of toggle buttons', () => {
    render(<ViewGroup defaultValue={['list']} />);
    const group = screen.getByRole('group', { name: 'View' });
    expect(group).toHaveAttribute('data-pharos-slot', 'toggle-group');
    expect(screen.getByRole('button', { name: 'List' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Grid' })).toHaveAttribute('aria-pressed', 'false');
  });

  it('presses one item at a time', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<ViewGroup defaultValue={['list']} onValueChange={onValueChange} />);

    await user.click(screen.getByRole('button', { name: 'Grid' }));

    expect(screen.getByRole('button', { name: 'Grid' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'List' })).toHaveAttribute('aria-pressed', 'false');
    expect(onValueChange).toHaveBeenCalledWith(['grid'], expect.anything());
  });

  it('keeps the pressed item pressed when it is pressed again', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<ViewGroup defaultValue={['list']} onValueChange={onValueChange} />);

    await user.click(screen.getByRole('button', { name: 'List' }));

    expect(screen.getByRole('button', { name: 'List' })).toHaveAttribute('aria-pressed', 'true');
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('lets a multiple group be left with nothing pressed', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<ViewGroup multiple defaultValue={['list']} onValueChange={onValueChange} />);

    await user.click(screen.getByRole('button', { name: 'Grid' }));
    expect(onValueChange).toHaveBeenLastCalledWith(['list', 'grid'], expect.anything());

    await user.click(screen.getByRole('button', { name: 'List' }));
    await user.click(screen.getByRole('button', { name: 'Grid' }));
    expect(onValueChange).toHaveBeenLastCalledWith([], expect.anything());
  });

  it('moves between items with the arrow keys and presses with Enter', async () => {
    const user = userEvent.setup();
    render(<ViewGroup defaultValue={['list']} />);

    await user.tab();
    expect(screen.getByRole('button', { name: 'List' })).toHaveFocus();
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('button', { name: 'Grid' })).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(screen.getByRole('button', { name: 'Grid' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('defaults to the md size and exposes the size it resolves', () => {
    const { rerender } = render(<ViewGroup defaultValue={['list']} />);
    expect(screen.getByRole('group')).toHaveAttribute('data-pharos-size', 'md');
    rerender(<ViewGroup defaultValue={['list']} size="sm" />);
    expect(screen.getByRole('group')).toHaveAttribute('data-pharos-size', 'sm');
  });

  it('does not press a disabled group', async () => {
    const user = userEvent.setup();
    render(<ViewGroup defaultValue={['list']} disabled />);

    await user.click(screen.getByRole('button', { name: 'Grid' }));

    expect(screen.getByRole('button', { name: 'Grid' })).toHaveAttribute('aria-pressed', 'false');
  });

  it('marks its items with a stable slot and merges className', () => {
    render(<ViewGroup defaultValue={['list']} className="custom" />);
    expect(screen.getByRole('group')).toHaveClass('custom');
    expect(screen.getByRole('button', { name: 'List' })).toHaveAttribute(
      'data-pharos-slot',
      'toggle-group-item',
    );
  });
});

describe('ToggleGroup ARIA', () => {
  it('carries no aria-orientation, which role="group" does not allow', () => {
    render(<ViewGroup defaultValue={['list']} />);
    expect(screen.getByRole('group')).not.toHaveAttribute('aria-orientation');
  });
});

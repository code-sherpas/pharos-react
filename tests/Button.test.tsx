import { createRef } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '../src/components/Button';

describe('Button', () => {
  it('renders a native button with the provided label', () => {
    render(<Button>Save</Button>);
    const button = screen.getByRole('button', { name: 'Save' });
    expect(button.tagName).toBe('BUTTON');
  });

  it('defaults to type="button" to avoid implicit form submission', () => {
    render(<Button>Save</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
  });

  it('respects an explicit type prop', () => {
    render(<Button type="submit">Submit</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');
  });

  it('applies the default intent and size classes when none are provided', () => {
    render(<Button>Default</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-primary-600');
    expect(button).toHaveClass('h-10');
  });

  it.each([
    ['primary', 'bg-primary-600'],
    ['secondary', 'bg-base-white'],
    ['ghost', 'bg-transparent'],
    ['destructive', 'bg-error'],
  ] as const)('applies the %s intent classes', (intent, expectedClass) => {
    render(<Button intent={intent}>Label</Button>);
    expect(screen.getByRole('button')).toHaveClass(expectedClass);
  });

  it.each([
    ['sm', 'h-8'],
    ['md', 'h-10'],
    ['lg', 'h-12'],
  ] as const)('applies the %s size classes', (size, expectedClass) => {
    render(<Button size={size}>Label</Button>);
    expect(screen.getByRole('button')).toHaveClass(expectedClass);
  });

  it('merges a custom className with the variant classes', () => {
    render(<Button className="custom-class">Label</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('custom-class');
    expect(button).toHaveClass('bg-primary-600');
  });

  it('forwards a ref to the underlying button element', () => {
    const ref = createRef<HTMLButtonElement>();
    render(<Button ref={ref}>Label</Button>);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  it('does not fire onClick when disabled', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Button disabled onClick={onClick}>
        Disabled
      </Button>,
    );
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    await user.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('activates on Enter when focused', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Activate</Button>);
    const button = screen.getByRole('button');
    button.focus();
    expect(button).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('activates on Space when focused', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Activate</Button>);
    const button = screen.getByRole('button');
    button.focus();
    await user.keyboard(' ');
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});

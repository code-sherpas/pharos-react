import { createRef, type MouseEvent } from 'react';
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

  it('composes with a custom element via the render prop (element form)', () => {
    render(
      <Button render={<a href="/dashboard" />} intent="secondary">
        Dashboard
      </Button>,
    );
    const link = screen.getByRole('link', { name: 'Dashboard' });
    expect(link.tagName).toBe('A');
    expect(link).toHaveAttribute('href', '/dashboard');
    expect(link).toHaveClass('bg-base-white');
  });

  it('composes with a custom element via the render prop (function form)', () => {
    render(
      <Button
        render={(props) => <a data-variant="link" {...props} href="/external" />}
        intent="ghost"
      >
        External
      </Button>,
    );
    const link = screen.getByRole('link', { name: 'External' });
    expect(link).toHaveAttribute('href', '/external');
    expect(link).toHaveAttribute('data-variant', 'link');
    expect(link).toHaveClass('bg-transparent');
  });

  it('merges className from the render element with the Button variants', () => {
    render(
      <Button render={<a className="outer-link" href="/x" />} className="user-class">
        Mixed
      </Button>,
    );
    const link = screen.getByRole('link');
    expect(link).toHaveClass('outer-link');
    expect(link).toHaveClass('user-class');
    expect(link).toHaveClass('bg-primary-600');
  });

  it('forwards onClick through the render prop composition', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn((event: MouseEvent) => event.preventDefault());
    render(
      <Button render={<a href="#" />} onClick={onClick}>
        Link
      </Button>,
    );
    await user.click(screen.getByRole('link'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});

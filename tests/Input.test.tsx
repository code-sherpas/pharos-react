import { createRef, useState } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from '../src/components/Input';

describe('Input', () => {
  it('renders a native input element', () => {
    render(<Input aria-label="email" />);
    const input = screen.getByRole('textbox', { name: 'email' });
    expect(input.tagName).toBe('INPUT');
  });

  it('defaults to type="text"', () => {
    render(<Input aria-label="name" />);
    expect(screen.getByRole('textbox', { name: 'name' })).toHaveAttribute('type', 'text');
  });

  it('respects an explicit type prop', () => {
    render(<Input aria-label="email" type="email" />);
    expect(screen.getByRole('textbox', { name: 'email' })).toHaveAttribute('type', 'email');
  });

  it('applies the default size when none is provided', () => {
    render(<Input aria-label="default" />);
    expect(screen.getByRole('textbox', { name: 'default' })).toHaveAttribute(
      'data-pharos-size',
      'md',
    );
  });

  it.each([['sm'], ['md'], ['lg']] as const)('exposes %s size through data-pharos-size', (size) => {
    render(<Input aria-label="sized" size={size} />);
    expect(screen.getByRole('textbox', { name: 'sized' })).toHaveAttribute(
      'data-pharos-size',
      size,
    );
  });

  it('forwards a ref to the underlying input element', () => {
    const ref = createRef<HTMLInputElement>();
    render(<Input aria-label="r" ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  it('forwards arbitrary native input props (id, name, placeholder)', () => {
    render(<Input id="email-field" name="email" placeholder="you@example.com" aria-label="e" />);
    const input = screen.getByRole('textbox', { name: 'e' });
    expect(input).toHaveAttribute('id', 'email-field');
    expect(input).toHaveAttribute('name', 'email');
    expect(input).toHaveAttribute('placeholder', 'you@example.com');
  });

  it('reflects aria-invalid on the DOM so styling can react to it', () => {
    render(<Input aria-label="invalid" aria-invalid="true" />);
    expect(screen.getByRole('textbox', { name: 'invalid' })).toHaveAttribute(
      'aria-invalid',
      'true',
    );
  });

  it('respects the readOnly attribute', () => {
    render(<Input aria-label="ro" readOnly value="locked" onChange={() => {}} />);
    const input = screen.getByRole('textbox', { name: 'ro' });
    expect(input).toHaveAttribute('readonly');
    expect(input).toHaveValue('locked');
  });

  it('does not fire onChange when disabled', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Input aria-label="d" disabled onChange={onChange} />);
    const input = screen.getByRole('textbox', { name: 'd' });
    expect(input).toBeDisabled();
    await user.type(input, 'hello');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('fires onChange as the user types', async () => {
    const user = userEvent.setup();

    function ControlledInput() {
      const [value, setValue] = useState('');
      return (
        <Input
          aria-label="typed"
          value={value}
          onChange={(event) => setValue(event.target.value)}
        />
      );
    }

    render(<ControlledInput />);
    const input = screen.getByRole('textbox', { name: 'typed' });
    await user.type(input, 'pharos');
    expect(input).toHaveValue('pharos');
  });

  it('merges a custom className with the size classes', () => {
    render(<Input aria-label="merged" className="custom-class" />);
    const input = screen.getByRole('textbox', { name: 'merged' });
    expect(input).toHaveClass('custom-class');
    expect(input).toHaveAttribute('data-pharos-size', 'md');
  });
});

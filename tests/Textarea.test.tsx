import { createRef, useState } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Textarea } from '../src/components/Textarea';

describe('Textarea', () => {
  it('renders a native textarea element', () => {
    render(<Textarea aria-label="bio" />);
    const textarea = screen.getByRole('textbox', { name: 'bio' });
    expect(textarea.tagName).toBe('TEXTAREA');
  });

  it('applies the default size when none is provided', () => {
    render(<Textarea aria-label="default" />);
    expect(screen.getByRole('textbox', { name: 'default' })).toHaveAttribute(
      'data-pharos-size',
      'md',
    );
  });

  it.each([['sm'], ['md'], ['lg']] as const)('exposes %s size through data-pharos-size', (size) => {
    render(<Textarea aria-label="sized" size={size} />);
    expect(screen.getByRole('textbox', { name: 'sized' })).toHaveAttribute(
      'data-pharos-size',
      size,
    );
  });

  it('forwards a ref to the underlying textarea element', () => {
    const ref = createRef<HTMLTextAreaElement>();
    render(<Textarea aria-label="r" ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLTextAreaElement);
  });

  it('forwards arbitrary native textarea props (id, name, placeholder, rows)', () => {
    render(<Textarea id="bio-field" name="bio" placeholder="Tell us…" rows={5} aria-label="b" />);
    const textarea = screen.getByRole('textbox', { name: 'b' });
    expect(textarea).toHaveAttribute('id', 'bio-field');
    expect(textarea).toHaveAttribute('name', 'bio');
    expect(textarea).toHaveAttribute('placeholder', 'Tell us…');
    expect(textarea).toHaveAttribute('rows', '5');
  });

  it('reflects aria-invalid on the DOM so styling can react to it', () => {
    render(<Textarea aria-label="invalid" aria-invalid="true" />);
    expect(screen.getByRole('textbox', { name: 'invalid' })).toHaveAttribute(
      'aria-invalid',
      'true',
    );
  });

  it('respects the readOnly attribute', () => {
    render(<Textarea aria-label="ro" readOnly value={'locked\nvalue'} onChange={() => {}} />);
    const textarea = screen.getByRole('textbox', { name: 'ro' });
    expect(textarea).toHaveAttribute('readonly');
    expect(textarea).toHaveValue('locked\nvalue');
  });

  it('does not fire onChange when disabled', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Textarea aria-label="d" disabled onChange={onChange} />);
    const textarea = screen.getByRole('textbox', { name: 'd' });
    expect(textarea).toBeDisabled();
    await user.type(textarea, 'hello');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('fires onChange as the user types and preserves line breaks', async () => {
    const user = userEvent.setup();

    function ControlledTextarea() {
      const [value, setValue] = useState('');
      return (
        <Textarea
          aria-label="typed"
          value={value}
          onChange={(event) => setValue(event.target.value)}
        />
      );
    }

    render(<ControlledTextarea />);
    const textarea = screen.getByRole('textbox', { name: 'typed' });
    await user.type(textarea, 'line one{Enter}line two');
    expect(textarea).toHaveValue('line one\nline two');
  });

  it('merges a custom className with the size classes', () => {
    render(<Textarea aria-label="merged" className="custom-class" />);
    const textarea = screen.getByRole('textbox', { name: 'merged' });
    expect(textarea).toHaveClass('custom-class');
    expect(textarea).toHaveAttribute('data-pharos-size', 'md');
  });
});

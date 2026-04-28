import { createRef } from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Spinner } from '../src/components/Spinner';

describe('Spinner', () => {
  it('renders a status node so assistive tech announces the loading state', () => {
    render(<Spinner />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('exposes the default visually-hidden label', () => {
    render(<Spinner />);
    expect(screen.getByText('Loading…')).toBeInTheDocument();
  });

  it('respects a custom srLabel for action-specific loading copy', () => {
    render(<Spinner srLabel="Saving template…" />);
    expect(screen.getByText('Saving template…')).toBeInTheDocument();
  });

  it('applies the default size when none is provided', () => {
    render(<Spinner />);
    expect(screen.getByRole('status')).toHaveAttribute('data-pharos-size', 'md');
  });

  it.each([['sm'], ['md'], ['lg']] as const)('exposes %s size through data-pharos-size', (size) => {
    render(<Spinner size={size} aria-label={`sized-${size}`} />);
    expect(screen.getByRole('status', { name: `sized-${size}` })).toHaveAttribute(
      'data-pharos-size',
      size,
    );
  });

  it('forwards a ref to the underlying span element', () => {
    const ref = createRef<HTMLSpanElement>();
    render(<Spinner ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLSpanElement);
  });

  it('forwards arbitrary native span props (id, style, aria-label)', () => {
    render(
      <Spinner id="loader-1" style={{ marginInlineStart: '0.5rem' }} aria-label="Custom label" />,
    );
    const status = screen.getByRole('status', { name: 'Custom label' });
    expect(status).toHaveAttribute('id', 'loader-1');
    expect(status).toHaveStyle({ marginInlineStart: '0.5rem' });
  });

  it('merges a custom className with the size classes', () => {
    render(<Spinner className="custom-class" />);
    const status = screen.getByRole('status');
    expect(status).toHaveClass('custom-class');
    expect(status).toHaveAttribute('data-pharos-size', 'md');
  });

  it('marks the inline svg as aria-hidden so the status announcement comes from srLabel only', () => {
    const { container } = render(<Spinner />);
    const svg = container.querySelector('svg');
    expect(svg).not.toBeNull();
    expect(svg).toHaveAttribute('aria-hidden', 'true');
  });

  it('renders any consumer-provided children alongside the spinner', () => {
    render(
      <Spinner srLabel="Loading…">
        <span data-testid="extra">extra</span>
      </Spinner>,
    );
    expect(screen.getByTestId('extra')).toBeInTheDocument();
  });
});

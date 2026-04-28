import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Separator } from '../src/components/Separator';

describe('Separator', () => {
  it('renders a div by default', () => {
    const { container } = render(<Separator data-testid="sep" />);
    const sep = container.querySelector('[data-testid="sep"]');
    expect(sep).not.toBeNull();
    expect(sep?.tagName).toBe('DIV');
  });

  it('defaults to horizontal orientation', () => {
    render(<Separator data-testid="sep" />);
    expect(screen.getByTestId('sep')).toHaveAttribute('data-pharos-orientation', 'horizontal');
  });

  it('exposes orientation through data-pharos-orientation', () => {
    render(<Separator orientation="vertical" data-testid="sep" />);
    expect(screen.getByTestId('sep')).toHaveAttribute('data-pharos-orientation', 'vertical');
  });

  it('marks the separator as role="none" by default (decorative)', () => {
    render(<Separator data-testid="sep" />);
    expect(screen.getByTestId('sep')).toHaveAttribute('role', 'none');
  });

  it('marks the separator as role="separator" when decorative={false}', () => {
    render(<Separator decorative={false} data-testid="sep" />);
    expect(screen.getByTestId('sep')).toHaveAttribute('role', 'separator');
  });

  it('omits aria-orientation on horizontal semantic separators (ARIA default)', () => {
    render(<Separator decorative={false} orientation="horizontal" data-testid="sep" />);
    expect(screen.getByTestId('sep')).not.toHaveAttribute('aria-orientation');
  });

  it('emits aria-orientation="vertical" on vertical semantic separators', () => {
    render(<Separator decorative={false} orientation="vertical" data-testid="sep" />);
    expect(screen.getByTestId('sep')).toHaveAttribute('aria-orientation', 'vertical');
  });

  it('omits aria-orientation when decorative (assistive tech ignores the node anyway)', () => {
    render(<Separator orientation="vertical" data-testid="sep" />);
    const sep = screen.getByTestId('sep');
    expect(sep).toHaveAttribute('role', 'none');
    expect(sep).not.toHaveAttribute('aria-orientation');
  });

  it('merges a custom className with the orientation class', () => {
    render(<Separator className="my-section" data-testid="sep" />);
    const sep = screen.getByTestId('sep');
    expect(sep).toHaveClass('my-section');
    expect(sep).toHaveAttribute('data-pharos-orientation', 'horizontal');
  });

  it('forwards arbitrary native div props (id, aria-label)', () => {
    render(<Separator id="section-divider" aria-label="Section divider" data-testid="sep" />);
    const sep = screen.getByTestId('sep');
    expect(sep).toHaveAttribute('id', 'section-divider');
    expect(sep).toHaveAttribute('aria-label', 'Section divider');
  });
});

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Badge } from '../src/components/Badge';

describe('Badge', () => {
  it('renders a span with the provided label', () => {
    const { container } = render(<Badge>Draft</Badge>);
    const badge = container.querySelector('span');
    expect(badge).not.toBeNull();
    expect(badge).toHaveTextContent('Draft');
  });

  it('applies the default variant when none is provided', () => {
    render(<Badge>Default</Badge>);
    const badge = screen.getByText('Default');
    expect(badge).toHaveAttribute('data-pharos-variant', 'default');
  });

  it.each([
    ['default'],
    ['secondary'],
    ['destructive'],
    ['outline'],
    ['success'],
    ['warning'],
    ['info'],
  ] as const)('exposes %s variant through data-pharos-variant', (variant) => {
    render(<Badge variant={variant}>Label</Badge>);
    expect(screen.getByText('Label')).toHaveAttribute('data-pharos-variant', variant);
  });

  it('merges a custom className with the variant classes', () => {
    render(<Badge className="custom-class">Label</Badge>);
    const badge = screen.getByText('Label');
    expect(badge).toHaveClass('custom-class');
    expect(badge).toHaveAttribute('data-pharos-variant', 'default');
  });

  it('forwards arbitrary span props (id, role, aria-*)', () => {
    render(
      <Badge id="my-badge" role="status" aria-live="polite">
        Live
      </Badge>,
    );
    const badge = screen.getByRole('status');
    expect(badge).toHaveAttribute('id', 'my-badge');
    expect(badge).toHaveAttribute('aria-live', 'polite');
  });

  it('renders an inline icon passed as a child', () => {
    render(
      <Badge variant="success">
        <svg data-testid="check" viewBox="0 0 16 16" />
        Verified
      </Badge>,
    );
    expect(screen.getByTestId('check')).toBeInTheDocument();
    expect(screen.getByText('Verified')).toBeInTheDocument();
  });
});

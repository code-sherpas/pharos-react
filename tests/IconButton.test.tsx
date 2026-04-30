import { createRef, type MouseEvent } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { IconButton } from '../src/components/IconButton';

const Icon = ({ testId = 'icon' }: { testId?: string }) => (
  <svg data-testid={testId} viewBox="0 0 24 24" aria-hidden="true">
    <path d="M0 0h24v24H0z" />
  </svg>
);

describe('IconButton', () => {
  it('renders a native button with the aria-label as accessible name', () => {
    render(
      <IconButton aria-label="Close">
        <Icon />
      </IconButton>,
    );
    const button = screen.getByRole('button', { name: 'Close' });
    expect(button.tagName).toBe('BUTTON');
  });

  it('defaults to type="button" to avoid implicit form submission', () => {
    render(
      <IconButton aria-label="Close">
        <Icon />
      </IconButton>,
    );
    expect(screen.getByRole('button', { name: 'Close' })).toHaveAttribute('type', 'button');
  });

  it('respects an explicit type prop', () => {
    render(
      <IconButton aria-label="Submit" type="submit">
        <Icon />
      </IconButton>,
    );
    expect(screen.getByRole('button', { name: 'Submit' })).toHaveAttribute('type', 'submit');
  });

  it('defaults to ghost intent and md size when none are provided', () => {
    render(
      <IconButton aria-label="Default">
        <Icon />
      </IconButton>,
    );
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('data-pharos-intent', 'ghost');
    expect(button).toHaveAttribute('data-pharos-size', 'md');
  });

  it.each([['primary'], ['secondary'], ['ghost'], ['destructive']] as const)(
    'exposes %s intent through data-pharos-intent',
    (intent) => {
      render(
        <IconButton aria-label="Variant" intent={intent}>
          <Icon />
        </IconButton>,
      );
      expect(screen.getByRole('button')).toHaveAttribute('data-pharos-intent', intent);
    },
  );

  it.each([['sm'], ['md'], ['lg']] as const)('exposes %s size through data-pharos-size', (size) => {
    render(
      <IconButton aria-label={`size-${size}`} size={size}>
        <Icon />
      </IconButton>,
    );
    expect(screen.getByRole('button', { name: `size-${size}` })).toHaveAttribute(
      'data-pharos-size',
      size,
    );
  });

  it('forwards a ref to the underlying button element', () => {
    const ref = createRef<HTMLButtonElement>();
    render(
      <IconButton aria-label="Ref" ref={ref}>
        <Icon />
      </IconButton>,
    );
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  it('does not fire onClick when disabled', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <IconButton aria-label="Disabled" disabled onClick={onClick}>
        <Icon />
      </IconButton>,
    );
    const button = screen.getByRole('button', { name: 'Disabled' });
    expect(button).toBeDisabled();
    await user.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('activates on Enter when focused', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <IconButton aria-label="Activate" onClick={onClick}>
        <Icon />
      </IconButton>,
    );
    const button = screen.getByRole('button', { name: 'Activate' });
    button.focus();
    expect(button).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('renders a Spinner instead of the icon when isLoading is true', () => {
    render(
      <IconButton aria-label="Saving" isLoading>
        <Icon testId="resting-icon" />
      </IconButton>,
    );
    expect(screen.queryByTestId('resting-icon')).not.toBeInTheDocument();
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('disables the button and exposes aria-busy while loading', () => {
    render(
      <IconButton aria-label="Saving" isLoading>
        <Icon />
      </IconButton>,
    );
    const button = screen.getByRole('button', { name: 'Saving' });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');
  });

  it('does not expose aria-busy when not loading', () => {
    render(
      <IconButton aria-label="Idle">
        <Icon />
      </IconButton>,
    );
    expect(screen.getByRole('button', { name: 'Idle' })).not.toHaveAttribute('aria-busy');
  });

  it('does not fire onClick while loading', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <IconButton aria-label="Saving" isLoading onClick={onClick}>
        <Icon />
      </IconButton>,
    );
    await user.click(screen.getByRole('button', { name: 'Saving' }));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('matches the Spinner size to the IconButton size', () => {
    render(
      <IconButton aria-label="Saving" size="lg" isLoading>
        <Icon />
      </IconButton>,
    );
    expect(screen.getByRole('status')).toHaveAttribute('data-pharos-size', 'lg');
  });

  it('merges a custom className with the variant classes', () => {
    render(
      <IconButton aria-label="Custom" className="custom-class">
        <Icon />
      </IconButton>,
    );
    const button = screen.getByRole('button');
    expect(button).toHaveClass('custom-class');
    expect(button).toHaveAttribute('data-pharos-intent', 'ghost');
  });

  it('composes with a custom element via the render prop (element form)', () => {
    render(
      <IconButton aria-label="Next" intent="secondary" render={<a href="/next" />}>
        <Icon />
      </IconButton>,
    );
    const link = screen.getByRole('link', { name: 'Next' });
    expect(link.tagName).toBe('A');
    expect(link).toHaveAttribute('href', '/next');
    expect(link).toHaveAttribute('data-pharos-intent', 'secondary');
  });

  it('forwards onClick through the render prop composition', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn((event: MouseEvent) => event.preventDefault());
    render(
      <IconButton aria-label="Link" render={<a href="#" />} onClick={onClick}>
        <Icon />
      </IconButton>,
    );
    await user.click(screen.getByRole('link', { name: 'Link' }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('accepts aria-labelledby instead of aria-label as the accessible name', () => {
    render(
      <>
        <span id="next-label">Next page</span>
        <IconButton aria-labelledby="next-label">
          <Icon />
        </IconButton>
      </>,
    );
    expect(screen.getByRole('button', { name: 'Next page' })).toBeInTheDocument();
  });
});

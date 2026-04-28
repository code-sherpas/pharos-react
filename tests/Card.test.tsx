import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '../src/components/Card';

describe('Card', () => {
  it('renders a div with the provided children', () => {
    render(<Card>Hello</Card>);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('applies the default variant when none is provided', () => {
    render(<Card>Default</Card>);
    expect(screen.getByText('Default')).toHaveAttribute('data-pharos-variant', 'default');
  });

  it.each([['default'], ['elevated'], ['outlined']] as const)(
    'exposes %s variant through data-pharos-variant',
    (variant) => {
      render(<Card variant={variant}>Label</Card>);
      expect(screen.getByText('Label')).toHaveAttribute('data-pharos-variant', variant);
    },
  );

  it('merges a custom className with the variant classes', () => {
    render(<Card className="custom-class">Label</Card>);
    const card = screen.getByText('Label');
    expect(card).toHaveClass('custom-class');
    expect(card).toHaveAttribute('data-pharos-variant', 'default');
  });

  it('forwards arbitrary native div props (id, role, aria-*)', () => {
    render(
      <Card id="my-card" role="region" aria-label="Profile">
        Region
      </Card>,
    );
    const card = screen.getByRole('region', { name: 'Profile' });
    expect(card).toHaveAttribute('id', 'my-card');
  });
});

describe('Card slots', () => {
  it('renders Header / Title / Description / Content / Footer with their own data-slot hooks', () => {
    render(
      <Card variant="default">
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Personal details</CardDescription>
        </CardHeader>
        <CardContent>Body</CardContent>
        <CardFooter>
          <span>Save</span>
        </CardFooter>
      </Card>,
    );

    expect(screen.getByText('Profile').closest('[data-pharos-slot="card-title"]')).not.toBeNull();
    expect(
      screen.getByText('Personal details').closest('[data-pharos-slot="card-description"]'),
    ).not.toBeNull();
    expect(screen.getByText('Body').closest('[data-pharos-slot="card-content"]')).not.toBeNull();
    expect(screen.getByText('Save').closest('[data-pharos-slot="card-footer"]')).not.toBeNull();
  });

  it('CardTitle renders as a div (consumer picks the heading level)', () => {
    render(<CardTitle>Heading</CardTitle>);
    expect(screen.getByText('Heading').tagName).toBe('DIV');
  });

  it('CardDescription renders as a paragraph for default semantics', () => {
    render(<CardDescription>Some description</CardDescription>);
    expect(screen.getByText('Some description').tagName).toBe('P');
  });

  it('every slot accepts arbitrary native props and a className override', () => {
    render(
      <CardHeader id="hdr" className="custom-hdr">
        <CardTitle id="ttl" className="custom-ttl">
          T
        </CardTitle>
      </CardHeader>,
    );
    const header = screen.getByText('T').closest('[data-pharos-slot="card-header"]');
    expect(header).toHaveAttribute('id', 'hdr');
    expect(header).toHaveClass('custom-hdr');
    expect(screen.getByText('T')).toHaveAttribute('id', 'ttl');
    expect(screen.getByText('T')).toHaveClass('custom-ttl');
  });
});

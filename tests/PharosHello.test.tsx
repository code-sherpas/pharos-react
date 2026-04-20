import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PharosHello } from '../src/components/PharosHello';

describe('PharosHello', () => {
  it('greets the default name', () => {
    render(<PharosHello />);
    expect(screen.getByText(/Pharos says hello, world\./)).toBeInTheDocument();
  });

  it('accepts a custom name', () => {
    render(<PharosHello name="Alexandria" />);
    expect(screen.getByText(/Pharos says hello, Alexandria\./)).toBeInTheDocument();
  });
});

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RadioGroup, RadioGroupItem } from '../src/components/RadioGroup';

function PaymentGroup(props: React.ComponentProps<typeof RadioGroup>) {
  return (
    <RadioGroup aria-label="Payment method" {...props}>
      <label htmlFor="card">
        <RadioGroupItem id="card" value="card" />
        Card
      </label>
      <label htmlFor="cash">
        <RadioGroupItem id="cash" value="cash" />
        Cash
      </label>
    </RadioGroup>
  );
}

describe('RadioGroup', () => {
  it('renders a radiogroup with radios, none selected by default', () => {
    render(<PaymentGroup />);
    expect(screen.getByRole('radiogroup', { name: 'Payment method' })).toBeInTheDocument();
    const radios = screen.getAllByRole('radio');
    expect(radios).toHaveLength(2);
    radios.forEach((r) => expect(r).toHaveAttribute('aria-checked', 'false'));
  });

  it('selects an option on click', async () => {
    const user = userEvent.setup();
    render(<PaymentGroup />);
    const card = screen.getByRole('radio', { name: 'Card' });

    await user.click(card);
    expect(card).toHaveAttribute('aria-checked', 'true');
  });

  it('enforces a single selection (choosing one deselects the other)', async () => {
    const user = userEvent.setup();
    render(<PaymentGroup />);
    const card = screen.getByRole('radio', { name: 'Card' });
    const cash = screen.getByRole('radio', { name: 'Cash' });

    await user.click(card);
    expect(card).toHaveAttribute('aria-checked', 'true');
    await user.click(cash);
    expect(cash).toHaveAttribute('aria-checked', 'true');
    expect(card).toHaveAttribute('aria-checked', 'false');
  });

  it('moves the selection with the arrow keys', async () => {
    const user = userEvent.setup();
    render(<PaymentGroup defaultValue="card" />);
    const card = screen.getByRole('radio', { name: 'Card' });
    const cash = screen.getByRole('radio', { name: 'Cash' });

    card.focus();
    await user.keyboard('{ArrowDown}');
    expect(cash).toHaveAttribute('aria-checked', 'true');
    expect(card).toHaveAttribute('aria-checked', 'false');
  });

  it('calls onValueChange with the selected value', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<PaymentGroup onValueChange={onValueChange} />);

    await user.click(screen.getByRole('radio', { name: 'Cash' }));
    expect(onValueChange).toHaveBeenCalledWith('cash', expect.anything());
  });

  it('does not select when the group is disabled', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<PaymentGroup disabled onValueChange={onValueChange} />);

    await user.click(screen.getByRole('radio', { name: 'Card' }));
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('does not select a disabled item', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <RadioGroup aria-label="Shipping" onValueChange={onValueChange}>
        <label htmlFor="std">
          <RadioGroupItem id="std" value="std" />
          Standard
        </label>
        <label htmlFor="over">
          <RadioGroupItem id="over" value="over" disabled />
          Overnight
        </label>
      </RadioGroup>,
    );

    await user.click(screen.getByRole('radio', { name: 'Overnight' }));
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('associates each item with a label and selects on label click', async () => {
    const user = userEvent.setup();
    render(<PaymentGroup />);
    await user.click(screen.getByText('Card'));
    expect(screen.getByRole('radio', { name: 'Card' })).toHaveAttribute('aria-checked', 'true');
  });

  it('tags the group and items via data-pharos-slot', () => {
    render(<PaymentGroup />);
    expect(screen.getByRole('radiogroup', { name: 'Payment method' })).toHaveAttribute(
      'data-pharos-slot',
      'radio-group',
    );
    screen
      .getAllByRole('radio')
      .forEach((r) => expect(r).toHaveAttribute('data-pharos-slot', 'radio-group-item'));
  });
});

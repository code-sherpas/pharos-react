import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRef, useState } from 'react';
import {
  Combobox,
  ComboboxControl,
  ComboboxChips,
  ComboboxInput,
  ComboboxTrigger,
  ComboboxChip,
  ComboboxChipRemove,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxEmpty,
} from '../src/components/Combobox';

const FRUITS = ['Apple', 'Apricot', 'Banana', 'Cherry'];

/**
 * A minimal single-select combobox: a filtering input and a list of fruits.
 * Asserts the APG **combobox** contract — an `<input role="combobox">` that
 * filters a popup listbox.
 */
function renderCombobox(props: { onValueChange?: (v: string | null) => void } = {}) {
  return render(
    <Combobox items={FRUITS} onValueChange={props.onValueChange}>
      <ComboboxControl>
        <ComboboxInput placeholder="Search fruit…" aria-label="Fruit" />
        <ComboboxTrigger aria-label="Open" />
      </ComboboxControl>
      <ComboboxContent>
        <ComboboxEmpty>No fruit found</ComboboxEmpty>
        <ComboboxList>
          {(item: string) => (
            <ComboboxItem key={item} value={item}>
              {item}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>,
  );
}

describe('Combobox', () => {
  it('renders the input with the combobox role and keeps the popup closed initially', () => {
    renderCombobox();
    expect(screen.getByRole('combobox', { name: 'Fruit' })).toBeInTheDocument();
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('opens on focus/click and lists the options', async () => {
    const user = userEvent.setup();
    renderCombobox();

    await user.click(screen.getByRole('combobox', { name: 'Fruit' }));

    expect(await screen.findByRole('listbox')).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Apple' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Banana' })).toBeInTheDocument();
    // Combobox, not a menu.
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('filters the options as the user types', async () => {
    const user = userEvent.setup();
    renderCombobox();

    const input = screen.getByRole('combobox', { name: 'Fruit' });
    await user.click(input);
    await user.type(input, 'Ap');

    // "Apple" and "Apricot" match "Ap"; "Banana" / "Cherry" are filtered out.
    await waitFor(() => {
      expect(screen.getByRole('option', { name: 'Apple' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Apricot' })).toBeInTheDocument();
      expect(screen.queryByRole('option', { name: 'Banana' })).not.toBeInTheDocument();
    });
  });

  it('shows the empty state when nothing matches', async () => {
    const user = userEvent.setup();
    renderCombobox();

    const input = screen.getByRole('combobox', { name: 'Fruit' });
    await user.click(input);
    await user.type(input, 'zzz');

    expect(await screen.findByText('No fruit found')).toBeInTheDocument();
    expect(screen.queryByRole('option')).not.toBeInTheDocument();
  });

  it('fires onValueChange when an option is picked', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderCombobox({ onValueChange });

    await user.click(screen.getByRole('combobox', { name: 'Fruit' }));
    await user.click(await screen.findByRole('option', { name: 'Cherry' }));

    expect(onValueChange).toHaveBeenCalledWith('Cherry', expect.anything());
  });

  it('marks the input expanded state via aria-expanded', async () => {
    const user = userEvent.setup();
    renderCombobox();
    const input = screen.getByRole('combobox', { name: 'Fruit' });

    expect(input).toHaveAttribute('aria-expanded', 'false');
    await user.click(input);
    await waitFor(() => expect(input).toHaveAttribute('aria-expanded', 'true'));
  });

  it('supports multi-select with removable chips', async () => {
    const user = userEvent.setup();
    function MultiCombobox() {
      const [value, setValue] = useState<string[]>([]);
      return (
        <div>
          <span data-testid="count">{value.length}</span>
          <Combobox multiple items={FRUITS} value={value} onValueChange={setValue}>
            <ComboboxChips>
              {value.map((v) => (
                <ComboboxChip key={v}>
                  {v}
                  <ComboboxChipRemove />
                </ComboboxChip>
              ))}
              <ComboboxInput inset placeholder="Add fruit…" aria-label="Fruits" />
            </ComboboxChips>
            <ComboboxContent>
              <ComboboxList>
                {(item: string) => (
                  <ComboboxItem key={item} value={item}>
                    {item}
                  </ComboboxItem>
                )}
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
        </div>
      );
    }
    render(<MultiCombobox />);

    await user.click(screen.getByRole('combobox', { name: 'Fruits' }));
    await user.click(await screen.findByRole('option', { name: 'Apple' }));
    await user.click(await screen.findByRole('option', { name: 'Banana' }));

    expect(screen.getByTestId('count')).toHaveTextContent('2');
    // Each selection renders a chip with a remove affordance.
    expect(screen.getAllByRole('button', { name: 'Remove' })).toHaveLength(2);

    // Removing a chip drops the value.
    await user.click(screen.getAllByRole('button', { name: 'Remove' })[0]);
    await waitFor(() => expect(screen.getByTestId('count')).toHaveTextContent('1'));
  });

  it('anchors the multi-select popup to the chips control box, not the input', async () => {
    // Regression guard for the panel-width fix: the floating listbox must be
    // positioned against the bordered chips box (full control width) rather
    // than the input that floats after the chips. We assert the wiring that
    // makes that possible — `ComboboxChips` forwarding its DOM node — since
    // jsdom does not compute the resulting layout width.
    const user = userEvent.setup();
    function MultiCombobox() {
      const chipsRef = useRef<HTMLDivElement>(null);
      return (
        <Combobox multiple items={FRUITS} defaultValue={['Apple']}>
          <ComboboxChips ref={chipsRef} data-testid="chips-box">
            <ComboboxChip>
              Apple
              <ComboboxChipRemove />
            </ComboboxChip>
            <ComboboxInput inset aria-label="Fruits" />
          </ComboboxChips>
          <ComboboxContent>
            <ComboboxList>
              {(item: string) => (
                <ComboboxItem key={item} value={item}>
                  {item}
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxContent>
          <button
            type="button"
            onClick={() => {
              // Surface the forwarded ref's target for the assertion below.
              chipsRef.current?.setAttribute('data-ref-attached', 'true');
            }}
          >
            probe
          </button>
        </Combobox>
      );
    }
    render(<MultiCombobox />);

    // The consumer's forwarded ref still resolves to the chips box (the slot
    // Pharos publishes as the popup anchor) — the merge with the internal
    // anchor ref must not drop it.
    await user.click(screen.getByRole('button', { name: 'probe' }));
    const chipsBox = screen.getByTestId('chips-box');
    expect(chipsBox).toHaveAttribute('data-pharos-slot', 'combobox-chips');
    expect(chipsBox).toHaveAttribute('data-ref-attached', 'true');
  });

  it('tags the input and content via data-pharos-slot', async () => {
    const user = userEvent.setup();
    renderCombobox();

    const input = screen.getByRole('combobox', { name: 'Fruit' });
    expect(input).toHaveAttribute('data-pharos-slot', 'combobox-input');

    await user.click(input);
    await screen.findByRole('listbox');
    expect(document.querySelector('[data-pharos-slot="combobox-content"]')).toBeInTheDocument();
  });
});

import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import {
  Combobox,
  ComboboxControl,
  ComboboxChips,
  ComboboxInput,
  ComboboxTrigger,
  ComboboxClear,
  ComboboxChip,
  ComboboxChipRemove,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxEmpty,
} from './Combobox';

/**
 * `Combobox` is the **filtering** half of the selection family (Decision
 * D17): a text input that narrows a known set of options. Its sibling
 * `Select` is the no-input listbox. Multi-select is the `multiple` axis,
 * rendering removable chips. Both wrap Base UI and share the popup surface
 * and the `min-width: var(--anchor-width)` affordance.
 *
 * The control chrome is composable: `ComboboxControl` / `ComboboxChips` own
 * the bordered box, `ComboboxInput` is the bare field, `ComboboxTrigger` the
 * chevron. The atom owns no label / helper / error (Escuela 1, D11).
 */
const meta: Meta<typeof Combobox> = {
  title: 'Components/Combobox',
  component: Combobox,
  parameters: { layout: 'centered' },
  decorators: [
    (Story) => (
      <div style={{ width: 280 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

const FRUITS = ['Apple', 'Apricot', 'Banana', 'Blueberry', 'Cherry', 'Mango', 'Orange'];

export const Default: Story = {
  render: () => (
    <Combobox items={FRUITS}>
      <ComboboxControl>
        <ComboboxInput placeholder="Search fruit…" aria-label="Fruit" />
        <ComboboxClear />
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
    </Combobox>
  ),
};

/** `defaultOpen` so Chromatic captures the popup and the option rows. */
export const OpenList: Story = {
  render: () => (
    <Combobox items={FRUITS} defaultOpen>
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
    </Combobox>
  ),
};

/** Multi-select: each selection becomes a removable chip in the control box,
 * and the popup stays open so the user can keep adding. */
export const Multiple: Story = {
  render: function MultipleStory() {
    const [value, setValue] = useState<string[]>(['Apple', 'Mango']);
    return (
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
          <ComboboxEmpty>No fruit found</ComboboxEmpty>
          <ComboboxList>
            {(item: string) => (
              <ComboboxItem key={item} value={item}>
                {item}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    );
  },
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <Combobox key={size} items={FRUITS}>
          <ComboboxControl>
            <ComboboxInput size={size} placeholder={`Size ${size}`} aria-label={`Size ${size}`} />
            <ComboboxTrigger aria-label="Open" />
          </ComboboxControl>
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
      ))}
    </div>
  ),
};

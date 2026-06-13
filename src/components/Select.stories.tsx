import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectGroup,
  SelectLabel,
  SelectSeparator,
} from './Select';

/**
 * `Select` is the **listbox** half of the selection family (Decision D17):
 * pick from a known set of options, no text input. Its sibling `Combobox`
 * adds a filtering input. Both wrap Base UI and share the popup surface,
 * option styling and the `min-width: var(--anchor-width)` affordance.
 *
 * The atom owns no label / helper / error (Escuela 1, D11) — compose those
 * around it and convey error via `aria-invalid` on the trigger.
 */
const meta: Meta<typeof Select> = {
  title: 'Components/Select',
  component: Select,
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

const VISIBILITY = { private: 'Private', organization: 'Organization', public: 'Public' };

export const Default: Story = {
  render: () => (
    <Select items={VISIBILITY}>
      <SelectTrigger aria-label="Visibility">
        <SelectValue placeholder="Select visibility" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="private">Private</SelectItem>
        <SelectItem value="organization">Organization</SelectItem>
        <SelectItem value="public">Public</SelectItem>
      </SelectContent>
    </Select>
  ),
};

/** `defaultOpen` so Chromatic captures the popup surface and option states. */
export const OpenListbox: Story = {
  render: () => (
    <Select defaultOpen defaultValue="organization" items={VISIBILITY}>
      <SelectTrigger aria-label="Visibility">
        <SelectValue placeholder="Select visibility" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="private">Private</SelectItem>
        <SelectItem value="organization">Organization</SelectItem>
        <SelectItem value="public">Public</SelectItem>
      </SelectContent>
    </Select>
  ),
};

/** Heights match the Input/Button grid so a Select sits flush on a form row. */
export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <Select key={size} items={{ a: 'Option A', b: 'Option B' }}>
          <SelectTrigger size={size} aria-label={`Size ${size}`}>
            <SelectValue placeholder={`Size ${size}`} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="a">Option A</SelectItem>
            <SelectItem value="b">Option B</SelectItem>
          </SelectContent>
        </Select>
      ))}
    </div>
  ),
};

/** Multi-select via the `multiple` axis: chips would normally render in the
 * trigger; here the controlled value count is shown for clarity. The popup
 * stays open as selections accumulate. */
export const Multiple: Story = {
  render: function MultipleStory() {
    const [value, setValue] = useState<string[]>(['admin']);
    return (
      <Select multiple value={value} onValueChange={setValue}>
        <SelectTrigger aria-label="Roles">
          <SelectValue placeholder="Pick roles">
            {(v: string[]) => (v.length ? `${v.length} selected` : 'Pick roles')}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="admin">Admin</SelectItem>
          <SelectItem value="editor">Editor</SelectItem>
          <SelectItem value="viewer">Viewer</SelectItem>
        </SelectContent>
      </Select>
    );
  },
};

export const Grouped: Story = {
  render: () => (
    <Select
      defaultOpen
      items={{
        orange: 'Orange',
        lemon: 'Lemon',
        strawberry: 'Strawberry',
        blueberry: 'Blueberry',
      }}
    >
      <SelectTrigger aria-label="Fruit">
        <SelectValue placeholder="Pick a fruit" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Citrus</SelectLabel>
          <SelectItem value="orange">Orange</SelectItem>
          <SelectItem value="lemon">Lemon</SelectItem>
        </SelectGroup>
        <SelectSeparator />
        <SelectGroup>
          <SelectLabel>Berries</SelectLabel>
          <SelectItem value="strawberry">Strawberry</SelectItem>
          <SelectItem value="blueberry">Blueberry</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  ),
};

/** Error state via the standard `aria-invalid` attribute on the trigger. */
export const Invalid: Story = {
  render: () => (
    <Select>
      <SelectTrigger aria-label="Visibility" aria-invalid>
        <SelectValue placeholder="Select visibility" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="private">Private</SelectItem>
        <SelectItem value="public">Public</SelectItem>
      </SelectContent>
    </Select>
  ),
};

export const Disabled: Story = {
  render: () => (
    <Select disabled>
      <SelectTrigger aria-label="Visibility">
        <SelectValue placeholder="Select visibility" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="private">Private</SelectItem>
      </SelectContent>
    </Select>
  ),
};

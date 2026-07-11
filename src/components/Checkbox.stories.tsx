import type { Meta, StoryObj } from '@storybook/react-vite';
import { Checkbox } from './Checkbox';

/**
 * `Checkbox` is a single square control (Decision D20). It wraps Base UI's
 * `Checkbox` — `role="checkbox"` (with `aria-checked="mixed"` for the
 * indeterminate state), Space to toggle, focus ring shared with Button /
 * Input. The atom owns no label (Escuela 1, D11): pair it with a
 * `<label htmlFor>`. Error state via `aria-invalid`.
 */
const meta: Meta<typeof Checkbox> = {
  title: 'Components/Checkbox',
  component: Checkbox,
  // Give the stories the DS base typography so the raw <label> text renders in
  // Outfit — a real consumer's app sets this as its base. Scoped to this meta
  // (not the global story root) so it never re-bases other components' stories.
  decorators: [
    (Story) => (
      <div
        style={{
          fontFamily: 'var(--pharos-font-family-sans)',
          fontSize: 'var(--pharos-font-size-sm)',
        }}
      >
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

/** The label pattern: a `<label htmlFor>` paired with the control. */
export const WithLabel: Story = {
  render: () => (
    <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }} htmlFor="terms">
      <Checkbox id="terms" defaultChecked />
      Accept the terms
    </label>
  ),
};

/** All resting states side by side (each labelled for a11y). */
export const States: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
      <Checkbox aria-label="Unchecked" />
      <Checkbox aria-label="Checked" defaultChecked />
      <Checkbox aria-label="Indeterminate" indeterminate />
      <Checkbox aria-label="Disabled" disabled />
      <Checkbox aria-label="Disabled checked" disabled defaultChecked />
    </div>
  ),
};

/** Error state via the standard `aria-invalid` attribute. */
export const Invalid: Story = {
  render: () => <Checkbox aria-label="Required option" aria-invalid />,
};

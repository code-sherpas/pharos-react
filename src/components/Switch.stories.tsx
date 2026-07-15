import type { Meta, StoryObj } from '@storybook/react-vite';
import { Switch } from './Switch';

/**
 * `Switch` is a single on/off toggle (Decision D21). It wraps Base UI's
 * `Switch` — `role="switch"`, Space to toggle, focus ring shared with Button /
 * Input / Checkbox. Sibling to `Checkbox` in the boolean form-control family;
 * a Switch takes effect immediately (a setting you flip). The atom owns no
 * label (Escuela 1, D11): pair it with a `<label htmlFor>`. Error state via
 * `aria-invalid`.
 */
const meta: Meta<typeof Switch> = {
  title: 'Components/Switch',
  component: Switch,
  // The raw <label> text inherits the DS base typography from the story canvas
  // (#storybook-root, set in preview.css after #151) — no decorator needed.
};

export default meta;
type Story = StoryObj<typeof meta>;

/** The label pattern: a `<label htmlFor>` paired with the control. */
export const WithLabel: Story = {
  render: () => (
    <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }} htmlFor="notify">
      <Switch id="notify" defaultChecked />
      Enable notifications
    </label>
  ),
};

/** All resting states side by side (each labelled for a11y). */
export const States: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
      <Switch aria-label="Off" />
      <Switch aria-label="On" defaultChecked />
      <Switch aria-label="Disabled" disabled />
      <Switch aria-label="Disabled on" disabled defaultChecked />
    </div>
  ),
};

/** Error state via the standard `aria-invalid` attribute. */
export const Invalid: Story = {
  render: () => <Switch aria-label="Required toggle" aria-invalid />,
};

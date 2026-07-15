import type { Meta, StoryObj } from '@storybook/react-vite';
import { RadioGroup, RadioGroupItem } from './RadioGroup';

/**
 * `RadioGroup` is a set of mutually exclusive options (Decision D22). It wraps
 * Base UI's `RadioGroup` + `Radio` — `role="radiogroup"` / `role="radio"`,
 * arrow-key navigation, focus ring shared with Button / Input / Checkbox /
 * Switch. Compound (group + item) because the selection semantics live on the
 * group. The atom owns no labels (Escuela 1, D11): pair the group with a
 * `<label>` / `aria-labelledby` and each item with a `<label htmlFor>`. Error
 * state via `aria-invalid` on the group.
 */
const meta: Meta<typeof RadioGroup> = {
  title: 'Components/RadioGroup',
  component: RadioGroup,
};

export default meta;
type Story = StoryObj<typeof meta>;

const row: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', gap: 8 };

/** The label pattern: a labelled group with a `<label htmlFor>` per item. */
export const Default: Story = {
  render: () => (
    <RadioGroup defaultValue="card" aria-labelledby="pay-label">
      <span id="pay-label">Payment method</span>
      <label style={row} htmlFor="pay-card">
        <RadioGroupItem id="pay-card" value="card" />
        Credit card
      </label>
      <label style={row} htmlFor="pay-cash">
        <RadioGroupItem id="pay-cash" value="cash" />
        Cash
      </label>
      <label style={row} htmlFor="pay-transfer">
        <RadioGroupItem id="pay-transfer" value="transfer" />
        Bank transfer
      </label>
    </RadioGroup>
  ),
};

/** A disabled individual item sits next to selectable ones. */
export const WithDisabledItem: Story = {
  render: () => (
    <RadioGroup defaultValue="standard" aria-label="Shipping speed">
      <label style={row} htmlFor="ship-standard">
        <RadioGroupItem id="ship-standard" value="standard" />
        Standard
      </label>
      <label style={row} htmlFor="ship-express">
        <RadioGroupItem id="ship-express" value="express" />
        Express
      </label>
      <label style={row} htmlFor="ship-overnight">
        <RadioGroupItem id="ship-overnight" value="overnight" disabled />
        Overnight (unavailable)
      </label>
    </RadioGroup>
  ),
};

/** The whole group disabled. */
export const Disabled: Story = {
  render: () => (
    <RadioGroup defaultValue="a" disabled aria-label="Disabled group">
      <label style={row} htmlFor="dis-a">
        <RadioGroupItem id="dis-a" value="a" />
        Option A
      </label>
      <label style={row} htmlFor="dis-b">
        <RadioGroupItem id="dis-b" value="b" />
        Option B
      </label>
    </RadioGroup>
  ),
};

/** Error state via the standard `aria-invalid` attribute on the group. */
export const Invalid: Story = {
  render: () => (
    <RadioGroup aria-invalid aria-label="Required choice">
      <label style={row} htmlFor="inv-yes">
        <RadioGroupItem id="inv-yes" value="yes" />
        Yes
      </label>
      <label style={row} htmlFor="inv-no">
        <RadioGroupItem id="inv-no" value="no" />
        No
      </label>
    </RadioGroup>
  ),
};

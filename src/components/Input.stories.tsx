import { Fragment } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Input } from './Input';

const SIZES = ['sm', 'md', 'lg'] as const;
const STATES = ['default', 'disabled', 'readonly', 'invalid'] as const;

const meta: Meta<typeof Input> = {
  title: 'Components/Input',
  component: Input,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'inline-radio',
      options: SIZES,
      description: 'Control size. Heights match the Button grid.',
      table: { defaultValue: { summary: 'md' } },
    },
    type: {
      control: 'inline-radio',
      options: ['text', 'email', 'password', 'search', 'url', 'tel', 'number'],
      description: 'Native HTML input type.',
      table: { defaultValue: { summary: 'text' } },
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text.',
    },
    disabled: { control: 'boolean' },
    readOnly: { control: 'boolean' },
  },
  args: {
    size: 'md',
    type: 'text',
    placeholder: 'you@example.com',
    disabled: false,
    readOnly: false,
  },
  render: (args) => (
    <div style={{ width: 320 }}>
      <Input aria-label="Storybook input" {...args} />
    </div>
  ),
};

export default meta;

type Story = StoryObj<typeof Input>;

export const Playground: Story = {};

export const Default: Story = {
  args: { placeholder: 'Default input' },
};

export const Disabled: Story = {
  args: { disabled: true, placeholder: 'Disabled' },
};

export const ReadOnly: Story = {
  args: { readOnly: true, defaultValue: 'Read-only value' },
};

export const Invalid: Story = {
  name: 'Invalid (aria-invalid)',
  parameters: {
    docs: {
      description: {
        story:
          'Error state is conveyed through the standard `aria-invalid="true"` attribute. ' +
          'Pharos has no `error` prop on the atom — composition with a `<Field>` molecule (planned) ' +
          'wires `aria-invalid` and renders the message text alongside the input.',
      },
    },
  },
  args: { 'aria-invalid': 'true', defaultValue: 'invalid@' },
};

export const WithLabel: Story = {
  name: 'With label (composition)',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'Composition pattern (Escuela 1): the consumer pairs a native `<label>` with the input, ' +
          'wired by `htmlFor` / `id`. The future `<Field>` molecule will encapsulate this same pattern ' +
          'plus the helper / error message slot.',
      },
    },
  },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', width: 320 }}>
      <label
        htmlFor="email-with-label"
        style={{
          fontFamily: 'var(--pharos-font-family-sans)',
          fontSize: 'var(--pharos-font-size-sm)',
          fontWeight: 'var(--pharos-font-weight-medium)',
          color: 'var(--pharos-color-neutral-900)',
        }}
      >
        Email
      </label>
      <Input id="email-with-label" type="email" placeholder="you@example.com" />
    </div>
  ),
};

export const Matrix: Story = {
  parameters: {
    controls: { disable: true },
    actions: { disable: true },
    layout: 'padded',
  },
  render: () => (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'auto repeat(3, 240px)',
        alignItems: 'center',
        gap: '1rem',
      }}
    >
      <span />
      {SIZES.map((size) => (
        <span key={size} className="storybook-matrix-label storybook-matrix-label-col">
          {size}
        </span>
      ))}
      {STATES.map((state) => (
        <Fragment key={state}>
          <span className="storybook-matrix-label-row">{state}</span>
          {SIZES.map((size) => (
            <Input
              key={`${state}-${size}`}
              size={size}
              aria-label={`${state} ${size}`}
              placeholder={state}
              disabled={state === 'disabled'}
              readOnly={state === 'readonly'}
              defaultValue={state === 'readonly' ? 'Read-only' : undefined}
              aria-invalid={state === 'invalid' ? 'true' : undefined}
            />
          ))}
        </Fragment>
      ))}
    </div>
  ),
};

import { Fragment } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Textarea } from './Textarea';

const SIZES = ['sm', 'md', 'lg'] as const;
const STATES = ['default', 'disabled', 'readonly', 'invalid'] as const;

const meta: Meta<typeof Textarea> = {
  title: 'Components/Textarea',
  component: Textarea,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'inline-radio',
      options: SIZES,
      description:
        'Control size. Inline padding and font-size match Input; vertical dimension uses min-height (textareas grow with content).',
      table: { defaultValue: { summary: 'md' } },
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text.',
    },
    rows: {
      control: 'number',
      description: 'Native HTML attribute. Sets the initial visible row count.',
    },
    disabled: { control: 'boolean' },
    readOnly: { control: 'boolean' },
  },
  args: {
    size: 'md',
    placeholder: 'Write a few lines…',
    disabled: false,
    readOnly: false,
  },
  render: (args) => (
    <div style={{ width: 360 }}>
      <Textarea aria-label="Storybook textarea" {...args} />
    </div>
  ),
};

export default meta;

type Story = StoryObj<typeof Textarea>;

export const Playground: Story = {};

export const Default: Story = {
  args: { placeholder: 'Default textarea' },
};

export const Disabled: Story = {
  args: { disabled: true, placeholder: 'Disabled' },
};

export const ReadOnly: Story = {
  args: {
    readOnly: true,
    defaultValue:
      'Read-only multi-line value.\nThe second line confirms the textarea preserves line breaks.',
  },
};

export const Invalid: Story = {
  name: 'Invalid (aria-invalid)',
  parameters: {
    docs: {
      description: {
        story:
          'Error state is conveyed through the standard `aria-invalid="true"` attribute. ' +
          'Pharos has no `error` prop on the atom — composition with a `<Field>` molecule (planned) ' +
          'wires `aria-invalid` and renders the message text alongside the textarea.',
      },
    },
  },
  args: { 'aria-invalid': 'true', defaultValue: 'Too short.' },
};

export const WithLabel: Story = {
  name: 'With label (composition)',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'Composition pattern (Escuela 1): the consumer pairs a native `<label>` with the textarea, ' +
          'wired by `htmlFor` / `id`. The future `<Field>` molecule will encapsulate this same pattern ' +
          'plus the helper / error message slot.',
      },
    },
  },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', width: 360 }}>
      <label
        htmlFor="bio-with-label"
        style={{
          fontFamily: 'var(--pharos-font-family-sans)',
          fontSize: 'var(--pharos-font-size-sm)',
          fontWeight: 'var(--pharos-font-weight-medium)',
          color: 'var(--pharos-color-neutral-900)',
        }}
      >
        Short bio
      </label>
      <Textarea id="bio-with-label" placeholder="Tell us about yourself…" />
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
        alignItems: 'start',
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
            <Textarea
              key={`${state}-${size}`}
              size={size}
              aria-label={`${state} ${size}`}
              placeholder={state}
              disabled={state === 'disabled'}
              readOnly={state === 'readonly'}
              defaultValue={state === 'readonly' ? 'Read-only\nsecond line' : undefined}
              aria-invalid={state === 'invalid' ? 'true' : undefined}
            />
          ))}
        </Fragment>
      ))}
    </div>
  ),
};

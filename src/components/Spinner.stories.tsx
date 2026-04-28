import { Fragment } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Spinner } from './Spinner';
import { Button } from './Button';

const SIZES = ['sm', 'md', 'lg'] as const;

const meta: Meta<typeof Spinner> = {
  title: 'Components/Spinner',
  component: Spinner,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'inline-radio',
      options: SIZES,
      description: 'Diameter. Aligns with the Button / Input / Textarea grid (16 / 20 / 24 px).',
      table: { defaultValue: { summary: 'md' } },
    },
    srLabel: {
      control: 'text',
      description: 'Visually hidden text announced by assistive tech.',
      table: { defaultValue: { summary: 'Loading…' } },
    },
  },
  args: {
    size: 'md',
    srLabel: 'Loading…',
  },
};

export default meta;

type Story = StoryObj<typeof Spinner>;

export const Playground: Story = {};

export const Default: Story = {};

export const Sizes: Story = {
  parameters: {
    controls: { disable: true },
  },
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
      {SIZES.map((size) => (
        <div
          key={size}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <Spinner size={size} />
          <span className="storybook-matrix-label">{size}</span>
        </div>
      ))}
    </div>
  ),
};

export const InsideButton: Story = {
  name: 'Composition: inside a Button',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'Spinner inherits `currentColor`, so it picks up the Button text colour automatically. ' +
          'Use this composition when the consuming code already has a Button and just needs to ' +
          'flip it into a loading state — no `Button isLoading` prop is required at the atom level.',
      },
    },
  },
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
      <Button intent="primary" disabled>
        <Spinner size="sm" srLabel="Saving…" />
        <span>Saving</span>
      </Button>
      <Button intent="secondary" disabled>
        <Spinner size="sm" srLabel="Loading…" />
        <span>Loading</span>
      </Button>
      <Button intent="destructive" disabled>
        <Spinner size="sm" srLabel="Deleting…" />
        <span>Deleting</span>
      </Button>
    </div>
  ),
};

export const ColourFromParent: Story = {
  name: 'Inherits parent `color`',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'No `tone` axis on the atom — set `color` on the parent (or pass `style`/`className`) ' +
          'to override. This matches Radix Themes and shadcn.',
      },
    },
  },
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
      <span style={{ color: 'var(--pharos-color-neutral-900)' }}>
        <Spinner aria-label="Default neutral spinner" />
      </span>
      <span style={{ color: 'var(--pharos-color-primary-600)' }}>
        <Spinner aria-label="Brand spinner" />
      </span>
      <span style={{ color: 'var(--pharos-color-semantic-error-fg)' }}>
        <Spinner aria-label="Destructive spinner" />
      </span>
      <span style={{ color: 'var(--pharos-color-semantic-success-fg)' }}>
        <Spinner aria-label="Success spinner" />
      </span>
    </div>
  ),
};

export const Matrix: Story = {
  parameters: {
    controls: { disable: true },
    actions: { disable: true },
    layout: 'padded',
  },
  render: () => {
    const tones = [
      { label: 'neutral', color: 'var(--pharos-color-neutral-900)' },
      { label: 'primary', color: 'var(--pharos-color-primary-600)' },
      { label: 'destructive', color: 'var(--pharos-color-semantic-error-fg)' },
    ] as const;
    return (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'auto repeat(3, 96px)',
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
        {tones.map(({ label, color }) => (
          <Fragment key={label}>
            <span className="storybook-matrix-label-row">{label}</span>
            {SIZES.map((size) => (
              <span key={`${label}-${size}`} style={{ color }}>
                <Spinner size={size} aria-label={`${label} ${size}`} />
              </span>
            ))}
          </Fragment>
        ))}
      </div>
    );
  },
};

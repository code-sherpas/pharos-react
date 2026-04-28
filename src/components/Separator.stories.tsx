import type { Meta, StoryObj } from '@storybook/react-vite';
import { Separator } from './Separator';

const meta: Meta<typeof Separator> = {
  title: 'Components/Separator',
  component: Separator,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    orientation: {
      control: 'inline-radio',
      options: ['horizontal', 'vertical'],
      description: 'Visual orientation of the divider line.',
      table: { defaultValue: { summary: 'horizontal' } },
    },
    decorative: {
      control: 'boolean',
      description:
        'When true (default) the separator is `role="none"`. When false it is `role="separator"` ' +
        'and announces a logical partition to assistive tech.',
      table: { defaultValue: { summary: 'true' } },
    },
  },
  args: {
    orientation: 'horizontal',
    decorative: true,
  },
};

export default meta;

type Story = StoryObj<typeof Separator>;

export const Playground: Story = {
  render: (args) => (
    <div
      style={{
        display: 'flex',
        flexDirection: args.orientation === 'horizontal' ? 'column' : 'row',
        alignItems: 'stretch',
        gap: '0.75rem',
        width: 320,
        height: args.orientation === 'horizontal' ? 'auto' : 96,
        fontFamily: 'var(--pharos-font-family-sans)',
        fontSize: 'var(--pharos-font-size-sm)',
        color: 'var(--pharos-color-neutral-900)',
      }}
    >
      <span>Section A</span>
      <Separator {...args} />
      <span>Section B</span>
    </div>
  ),
};

export const Horizontal: Story = {
  args: { orientation: 'horizontal' },
  render: (args) => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        width: 320,
        fontFamily: 'var(--pharos-font-family-sans)',
        fontSize: 'var(--pharos-font-size-sm)',
        color: 'var(--pharos-color-neutral-900)',
      }}
    >
      <span>Above</span>
      <Separator {...args} />
      <span>Below</span>
    </div>
  ),
};

export const Vertical: Story = {
  args: { orientation: 'vertical' },
  render: (args) => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: '0.75rem',
        height: 80,
        fontFamily: 'var(--pharos-font-family-sans)',
        fontSize: 'var(--pharos-font-size-sm)',
        color: 'var(--pharos-color-neutral-900)',
      }}
    >
      <span>Left</span>
      <Separator {...args} />
      <span>Right</span>
    </div>
  ),
};

export const Semantic: Story = {
  name: 'Semantic (decorative={false})',
  parameters: {
    docs: {
      description: {
        story:
          'When the separator carries a logical partition that screen readers should announce ' +
          '(e.g. between groups in a menu, between sections of a long form), pass `decorative={false}`. ' +
          'The element becomes `role="separator"` and, for vertical separators, exposes ' +
          '`aria-orientation="vertical"`.',
      },
    },
  },
  args: { orientation: 'horizontal', decorative: false },
  render: (args) => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        width: 320,
        fontFamily: 'var(--pharos-font-family-sans)',
        fontSize: 'var(--pharos-font-size-sm)',
        color: 'var(--pharos-color-neutral-900)',
      }}
    >
      <span>Account settings</span>
      <Separator {...args} />
      <span>Notification preferences</span>
    </div>
  ),
};

export const InCard: Story = {
  name: 'Inside a panel surface',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'The default `neutral-200` tone matches the resting border of non-interactive containers ' +
          '(Card, panels) — see Decision D12. Inside a panel the Separator reads as a soft partition, ' +
          'leaving interactive controls (`Input`, `Button`, `Badge outline`) as the visually dominant elements.',
      },
    },
  },
  render: () => (
    <div
      style={{
        width: 360,
        background: 'var(--pharos-color-base-white)',
        border: '1px solid var(--pharos-color-neutral-200)',
        borderRadius: 'var(--pharos-radius-md)',
        padding: '1rem 1.25rem',
        fontFamily: 'var(--pharos-font-family-sans)',
        color: 'var(--pharos-color-neutral-900)',
      }}
    >
      <h3
        style={{
          margin: 0,
          fontSize: 'var(--pharos-font-size-base)',
          fontWeight: 'var(--pharos-font-weight-semibold)',
        }}
      >
        Profile
      </h3>
      <p
        style={{
          margin: '0.25rem 0 0',
          fontSize: 'var(--pharos-font-size-sm)',
          color: 'var(--pharos-color-neutral-500)',
        }}
      >
        Personal details visible to your team.
      </p>
      <Separator style={{ marginTop: '1rem', marginBottom: '1rem' }} />
      <p style={{ margin: 0, fontSize: 'var(--pharos-font-size-sm)' }}>
        Display name, email, and timezone settings live below.
      </p>
    </div>
  ),
};

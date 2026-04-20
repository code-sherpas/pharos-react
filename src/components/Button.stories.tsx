import { Fragment } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from './Button';

const INTENTS = ['primary', 'secondary', 'ghost', 'destructive'] as const;
const SIZES = ['sm', 'md', 'lg'] as const;

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    intent: {
      control: 'inline-radio',
      options: INTENTS,
      description: 'Visual intent of the action.',
      table: {
        defaultValue: { summary: 'primary' },
      },
    },
    size: {
      control: 'inline-radio',
      options: SIZES,
      description: 'Control size.',
      table: {
        defaultValue: { summary: 'md' },
      },
    },
    disabled: {
      control: 'boolean',
      description: 'Disable the button and its interactions.',
    },
    children: {
      control: 'text',
      description: 'Button label. Accepts any React node.',
    },
    onClick: { action: 'clicked' },
  },
  args: {
    children: 'Button',
    intent: 'primary',
    size: 'md',
    disabled: false,
  },
};

export default meta;

type Story = StoryObj<typeof Button>;

export const Playground: Story = {};

export const Primary: Story = {
  args: { intent: 'primary', children: 'Primary action' },
};

export const Secondary: Story = {
  args: { intent: 'secondary', children: 'Secondary action' },
};

export const Ghost: Story = {
  args: { intent: 'ghost', children: 'Ghost action' },
};

export const Destructive: Story = {
  args: { intent: 'destructive', children: 'Delete account' },
};

export const Disabled: Story = {
  args: { disabled: true, children: 'Disabled' },
};

export const Matrix: Story = {
  parameters: {
    controls: { disable: true },
    actions: { disable: true },
  },
  render: () => (
    <div className="grid grid-cols-[auto_repeat(3,auto)] items-center gap-4">
      <span />
      {SIZES.map((size) => (
        <span key={size} className="text-center text-sm font-medium text-neutral-500 uppercase">
          {size}
        </span>
      ))}
      {INTENTS.map((intent) => (
        <Fragment key={intent}>
          <span className="text-sm font-medium text-neutral-500 capitalize">{intent}</span>
          {SIZES.map((size) => (
            <Button key={`${intent}-${size}`} intent={intent} size={size}>
              {intent}
            </Button>
          ))}
        </Fragment>
      ))}
    </div>
  ),
};

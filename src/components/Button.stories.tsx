import { Fragment } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
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

/** Disabled the focusable way (ARIA APG): `aria-disabled="true"` looks like
 * `disabled` but keeps the button focusable, so a control that turns busy
 * while it has focus does not drop a keyboard user. The press still reaches
 * `onClick`: the consumer decides whether it does nothing or says why. */
export const AriaDisabled: Story = {
  name: 'Disabled, focusable (aria-disabled)',
  args: { 'aria-disabled': 'true', children: 'Saving…' },
  play: async ({ canvasElement }) => {
    const button = within(canvasElement).getByRole('button', { name: 'Saving…' });
    await expect(button).not.toBeDisabled();
    await expect(getComputedStyle(button).opacity).toBe('0.5');
    button.focus();
    await expect(button).toHaveFocus();
  },
};

export const AsLink: Story = {
  name: 'As link (render prop)',
  parameters: {
    docs: {
      description: {
        story:
          'Compose `<Button>` with another element using Base UI’s `render` prop. ' +
          'Styles and event handlers are merged onto the outer element — here an anchor — ' +
          'so a navigation link can inherit Button styling without any wrapper markup.',
      },
    },
  },
  args: {
    intent: 'secondary',
    children: 'Open docs',
  },
  render: (args) => (
    <Button
      {...args}
      render={
        <a href="https://pharos-react-storybook.onrender.com" target="_blank" rel="noreferrer" />
      }
    />
  ),
};

export const Matrix: Story = {
  parameters: {
    controls: { disable: true },
    actions: { disable: true },
  },
  render: () => (
    <div className="storybook-matrix">
      <span />
      {SIZES.map((size) => (
        <span key={size} className="storybook-matrix-label storybook-matrix-label-col">
          {size}
        </span>
      ))}
      {INTENTS.map((intent) => (
        <Fragment key={intent}>
          <span className="storybook-matrix-label-row">{intent}</span>
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

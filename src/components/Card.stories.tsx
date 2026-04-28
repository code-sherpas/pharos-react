import { Fragment } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './Card';
import { Button } from './Button';
import { Separator } from './Separator';

const VARIANTS = ['default', 'elevated', 'outlined'] as const;

const meta: Meta<typeof Card> = {
  title: 'Components/Card',
  component: Card,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'inline-radio',
      options: VARIANTS,
      description: 'Boundary intensity. Default is the subtle non-interactive tone (D12).',
      table: { defaultValue: { summary: 'default' } },
    },
  },
  args: {
    variant: 'default',
  },
};

export default meta;

type Story = StoryObj<typeof Card>;

export const Playground: Story = {
  render: (args) => (
    <Card {...args} style={{ width: 360 }}>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
        <CardDescription>Personal details visible to your team.</CardDescription>
      </CardHeader>
      <CardContent>
        <p style={{ margin: 0, fontSize: 'var(--pharos-font-size-sm)' }}>
          Display name, email, and timezone settings live in this section.
        </p>
      </CardContent>
      <CardFooter>
        <Button intent="primary" size="sm">
          Save
        </Button>
        <Button intent="ghost" size="sm">
          Cancel
        </Button>
      </CardFooter>
    </Card>
  ),
};

export const Default: Story = {
  args: { variant: 'default' },
  render: Playground.render,
};

export const Elevated: Story = {
  args: { variant: 'elevated' },
  render: Playground.render,
};

export const Outlined: Story = {
  args: { variant: 'outlined' },
  render: Playground.render,
};

export const WithSeparator: Story = {
  name: 'Header / body partition with Separator',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'Inside a Card, a `<Separator>` reads as a soft partition between sub-regions. Both share the ' +
          'subtle `neutral-200` tone (D12), so the line lives within the same boundary tier as the card ' +
          'border. The Button below sits on the strong `neutral-500` tier reserved for interactive controls — ' +
          'the hierarchy makes it the visually dominant element.',
      },
    },
  },
  render: () => (
    <Card style={{ width: 420 }}>
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
        <CardDescription>Choose how you receive updates.</CardDescription>
      </CardHeader>
      <Separator />
      <CardContent>
        <p style={{ margin: 0, fontSize: 'var(--pharos-font-size-sm)' }}>
          Email, in-app and digest preferences live below.
        </p>
      </CardContent>
      <CardFooter>
        <Button intent="secondary" size="sm">
          Manage preferences
        </Button>
      </CardFooter>
    </Card>
  ),
};

export const ContentOnly: Story = {
  name: 'Content only (no Header / Footer)',
  parameters: { controls: { disable: true } },
  render: () => (
    <Card style={{ width: 320 }}>
      <CardContent style={{ padding: 'var(--pharos-spacing-6)' }}>
        A bare card containing only body content. The slot-level padding pattern keeps the layout
        consistent with header/footer cards when present.
      </CardContent>
    </Card>
  ),
};

export const Matrix: Story = {
  parameters: {
    controls: { disable: true },
    actions: { disable: true },
  },
  render: () => (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 280px)',
        gap: '1rem',
        alignItems: 'start',
      }}
    >
      {VARIANTS.map((variant) => (
        <Fragment key={variant}>
          <Card variant={variant}>
            <CardHeader>
              <CardTitle style={{ textTransform: 'capitalize' }}>{variant}</CardTitle>
              <CardDescription>
                Variant <code>{variant}</code> on the border-intensity hierarchy.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p style={{ margin: 0, fontSize: 'var(--pharos-font-size-sm)' }}>
                Body content lines up the same height across the three variants because every slot
                uses the spacing scale.
              </p>
            </CardContent>
            <CardFooter>
              <Button intent="ghost" size="sm">
                Action
              </Button>
            </CardFooter>
          </Card>
        </Fragment>
      ))}
    </div>
  ),
};

import type { Meta, StoryObj } from '@storybook/react-vite';
import { Badge } from './Badge';

const VARIANTS = [
  'default',
  'secondary',
  'destructive',
  'outline',
  'success',
  'warning',
  'info',
] as const;

const meta: Meta<typeof Badge> = {
  title: 'Components/Badge',
  component: Badge,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: VARIANTS,
      description: 'Visual variant. Drives surface, label and border.',
      table: {
        defaultValue: { summary: 'default' },
      },
    },
    children: {
      control: 'text',
      description: 'Badge content. Pass plain text or text + SVG icon.',
    },
  },
  args: {
    children: 'Badge',
    variant: 'default',
  },
};

export default meta;

type Story = StoryObj<typeof Badge>;

export const Playground: Story = {};

export const Default: Story = {
  args: { variant: 'default', children: 'Default' },
};

export const Secondary: Story = {
  args: { variant: 'secondary', children: 'Secondary' },
};

export const Destructive: Story = {
  args: { variant: 'destructive', children: 'Destructive' },
};

export const Outline: Story = {
  args: { variant: 'outline', children: 'Outline' },
};

export const Success: Story = {
  args: { variant: 'success', children: 'Published' },
};

export const Warning: Story = {
  args: { variant: 'warning', children: 'Needs review' },
};

export const Info: Story = {
  args: { variant: 'info', children: 'Beta' },
};

export const WithIcon: Story = {
  name: 'With leading icon',
  args: {
    variant: 'success',
    children: (
      <>
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 8l3 3 7-7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Verified
      </>
    ),
  },
  parameters: {
    docs: {
      description: {
        story:
          'Icons compose as plain children. The base style auto-sizes any direct `<svg>` child to ' +
          '0.75em so consumers do not have to set width/height manually.',
      },
    },
  },
};

export const Matrix: Story = {
  parameters: {
    controls: { disable: true },
    actions: { disable: true },
  },
  render: () => (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.75rem',
        alignItems: 'center',
      }}
    >
      {VARIANTS.map((variant) => (
        <Badge key={variant} variant={variant}>
          {variant}
        </Badge>
      ))}
    </div>
  ),
};

import type { Meta, StoryObj } from '@storybook/react-vite';
import { PharosHello } from './PharosHello';

const meta: Meta<typeof PharosHello> = {
  title: 'Components/PharosHello',
  component: PharosHello,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    name: {
      control: 'text',
      description: 'Name to greet.',
    },
  },
};

export default meta;

type Story = StoryObj<typeof PharosHello>;

export const Default: Story = {};

export const WithName: Story = {
  args: { name: 'Alexandria' },
};

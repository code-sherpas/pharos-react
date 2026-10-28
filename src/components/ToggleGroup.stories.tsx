import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { ToggleGroup, ToggleGroupItem } from './ToggleGroup';

/**
 * `ToggleGroup` shows two to five options side by side, where choosing one
 * changes what the view shows at once (D25: the artifact's SegmentedControl
 * under shadcn's name). It wraps Base UI's `ToggleGroup` + `Toggle` —
 * `role="group"` of `aria-pressed` buttons, one tab stop, arrow keys to move,
 * Enter or Space to press. In single mode one item always stays pressed. It
 * owns no label: name the group with `aria-label` or `aria-labelledby`.
 */
const meta: Meta<typeof ToggleGroup> = {
  title: 'Components/ToggleGroup',
  component: ToggleGroup,
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md'],
      table: { defaultValue: { summary: 'md' } },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

/** Controlled: the value is an array, as in Base UI. */
export const Default: Story = {
  render: function ViewSwitcher(args) {
    const [view, setView] = useState('list');
    return (
      <ToggleGroup
        {...args}
        aria-label="View"
        value={[view]}
        onValueChange={(next) => setView(next[0] ?? view)}
      >
        <ToggleGroupItem value="list">List</ToggleGroupItem>
        <ToggleGroupItem value="grid">Grid</ToggleGroupItem>
        <ToggleGroupItem value="board">Board</ToggleGroupItem>
      </ToggleGroup>
    );
  },
};

/** The two heights of the control grid: 32px (`sm`) and 40px (`md`). */
export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 12, justifyItems: 'start' }}>
      <ToggleGroup aria-label="Period, small" size="sm" defaultValue={['week']}>
        <ToggleGroupItem value="day">Day</ToggleGroupItem>
        <ToggleGroupItem value="week">Week</ToggleGroupItem>
        <ToggleGroupItem value="month">Month</ToggleGroupItem>
      </ToggleGroup>
      <ToggleGroup aria-label="Period, medium" defaultValue={['week']}>
        <ToggleGroupItem value="day">Day</ToggleGroupItem>
        <ToggleGroupItem value="week">Week</ToggleGroupItem>
        <ToggleGroupItem value="month">Month</ToggleGroupItem>
      </ToggleGroup>
    </div>
  ),
};

/** A disabled item sits next to selectable ones; a disabled group dims all. */
export const Disabled: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 12, justifyItems: 'start' }}>
      <ToggleGroup aria-label="Export format" defaultValue={['csv']}>
        <ToggleGroupItem value="csv">CSV</ToggleGroupItem>
        <ToggleGroupItem value="xlsx">Excel</ToggleGroupItem>
        <ToggleGroupItem value="pdf" disabled>
          PDF
        </ToggleGroupItem>
      </ToggleGroup>
      <ToggleGroup aria-label="Export format, locked" defaultValue={['csv']} disabled>
        <ToggleGroupItem value="csv">CSV</ToggleGroupItem>
        <ToggleGroupItem value="xlsx">Excel</ToggleGroupItem>
      </ToggleGroup>
    </div>
  ),
};

/** `multiple`: any number of items pressed, none included. */
export const Multiple: Story = {
  render: () => (
    <ToggleGroup aria-label="Show" multiple defaultValue={['open']}>
      <ToggleGroupItem value="open">Open</ToggleGroupItem>
      <ToggleGroupItem value="assigned">Assigned to me</ToggleGroupItem>
      <ToggleGroupItem value="overdue">Overdue</ToggleGroupItem>
    </ToggleGroup>
  ),
};

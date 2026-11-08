import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import {
  SidePanel,
  SidePanelTrigger,
  SidePanelContent,
  SidePanelHeader,
  SidePanelTitle,
  SidePanelDescription,
  SidePanelFooter,
  SidePanelClose,
} from './SidePanel.js';
import { Button } from './Button.js';
import { Input } from './Input.js';
import { Textarea } from './Textarea.js';

/**
 * `SidePanel` is a contextual panel for a task done beside the content: a
 * form next to the report it acts on. From the panel breakpoint
 * (`breakpoint.panel`, 64rem) up it sits **inline** — a named `<aside>` in
 * the consumer's row that narrows the content, with no backdrop and no focus
 * trap; below it, the same panel opens as the modal `Sheet`.
 *
 * Focus moves into the panel when it opens and back to the trigger when it
 * closes; Escape with focus inside closes it. Inline, a click outside or
 * tabbing out leaves it open. `side` is `right` (default) or `left`.
 *
 * Resize the canvas below 64rem to see the modal form.
 */
const meta: Meta<typeof SidePanel> = {
  title: 'Components/SidePanel',
  component: SidePanel,
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<typeof meta>;

function Report() {
  return (
    <main style={{ flex: 1, minWidth: 0, padding: 'var(--pharos-spacing-6)' }}>
      <h1 style={{ marginTop: 0 }}>Assessment report</h1>
      <p>
        The team met four of its six goals this quarter. Delivery is steady, and the review cadence
        held through the release.
      </p>
      <p>Two goals slipped: onboarding documentation and the on-call rotation.</p>
    </main>
  );
}

function ActionForm({ side }: { side?: 'left' | 'right' }) {
  return (
    <SidePanelContent side={side}>
      <SidePanelHeader>
        <SidePanelTitle>New action</SidePanelTitle>
        <SidePanelDescription>Add a step to the coaching plan.</SidePanelDescription>
      </SidePanelHeader>
      <div style={{ display: 'grid', gap: 'var(--pharos-spacing-2)' }}>
        <label htmlFor="story-action-name">Name</label>
        <Input id="story-action-name" placeholder="Write the onboarding guide" />
        <label htmlFor="story-action-notes">Notes</label>
        <Textarea id="story-action-notes" />
      </div>
      <SidePanelFooter>
        <SidePanelClose render={<Button intent="ghost">Cancel</Button>} />
        <SidePanelClose render={<Button>Save</Button>} />
      </SidePanelFooter>
    </SidePanelContent>
  );
}

function Layout({ side, defaultOpen }: { side?: 'left' | 'right'; defaultOpen?: boolean }) {
  return (
    <SidePanel defaultOpen={defaultOpen}>
      <div style={{ padding: 'var(--pharos-spacing-4)' }}>
        <SidePanelTrigger render={<Button intent="secondary">Add action</Button>} />
      </div>
      {/* The panel goes on the side it docks to, in the DOM as on screen. */}
      <div style={{ display: 'flex', minHeight: '24rem' }}>
        {side === 'left' && <ActionForm side="left" />}
        <Report />
        {side !== 'left' && <ActionForm />}
      </div>
    </SidePanel>
  );
}

/** Interactive: press the trigger to open the panel beside the report. */
export const Default: Story = {
  render: () => <Layout />,
};

/** Open, so Chromatic captures the inline panel narrowing the report. */
export const Open: Story = {
  render: () => <Layout defaultOpen />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const panel = canvas.queryByRole('complementary', { name: 'New action' });
    // The test runner's canvas is wider than the panel breakpoint.
    await expect(panel).toHaveAttribute('data-pharos-mode', 'inline');
  },
};

/** Docked on the left: the panel comes first in the row. */
export const Left: Story = {
  render: () => <Layout side="left" defaultOpen />,
};

/**
 * Below the breakpoint: Chromatic captures it at a phone width, where the
 * same panel opens as the modal Sheet over the report.
 */
export const Narrow: Story = {
  render: () => <Layout defaultOpen />,
  parameters: { chromatic: { viewports: [375] } },
};

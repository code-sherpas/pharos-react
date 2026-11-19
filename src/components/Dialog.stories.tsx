import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from './Dialog';
import { Button } from './Button';
import { Input } from './Input';
import { Textarea } from './Textarea';

/**
 * `Dialog` is a **centered** modal panel (Decision D19). It wraps Base UI's
 * `Dialog` — focus trap, scroll lock, backdrop, Escape / backdrop-click
 * dismiss, focus return to the trigger. Sibling of `Sheet` (edge-docked);
 * distinct from `Popover` (non-modal, anchored) and `DropdownMenu`
 * (menu-button). Below the compact width (`breakpoint.compact` in
 * pharos-tokens) the same panel fills the screen, with the header and the
 * footer always in view and only the body scrolling between them. There its
 * height follows the visual viewport, so with a phone's on-screen keyboard
 * open the footer sits right above the keyboard and the focused field stays
 * in view; the centered panel stays within the visual viewport too (exercised
 * in the consumer harness: a story cannot open a keyboard).
 */
const meta: Meta<typeof Dialog> = {
  title: 'Components/Dialog',
  component: Dialog,
};

export default meta;
type Story = StoryObj<typeof meta>;

/** Interactive: click the trigger to open the centered dialog. */
export const Default: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger render={<Button intent="destructive">Delete project</Button>} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete project?</DialogTitle>
          <DialogDescription>
            This permanently removes the project and all of its data.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose render={<Button intent="ghost">Cancel</Button>} />
          <DialogClose render={<Button intent="destructive">Delete</Button>} />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

/** `defaultOpen` so Chromatic captures the centered panel + backdrop. */
export const Open: Story = {
  render: () => (
    <Dialog defaultOpen>
      <DialogTrigger render={<Button intent="destructive">Delete project</Button>} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete project?</DialogTitle>
          <DialogDescription>
            This permanently removes the project and all of its data.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose render={<Button intent="ghost">Cancel</Button>} />
          <DialogClose render={<Button intent="destructive">Delete</Button>} />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

const FIELD_STYLE = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--pharos-spacing-2)',
} as const;

function fieldId(label: string): string {
  return `compact-${label.toLowerCase().replaceAll(' ', '-')}`;
}

/**
 * Below the compact breakpoint: Chromatic captures it at a phone width, where
 * the dialog fills the screen. The form is taller than the screen, so the
 * body scrolls between the header and the footer, which stay in view.
 */
export const Compact: Story = {
  render: () => (
    <Dialog defaultOpen>
      <DialogTrigger render={<Button>New pillar</Button>} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New pillar</DialogTitle>
          <DialogDescription>A pillar groups the categories of the taxonomy.</DialogDescription>
        </DialogHeader>
        {['Name', 'Owner', 'Short code', 'Review cycle'].map((label) => (
          <div key={label} style={FIELD_STYLE}>
            <label htmlFor={fieldId(label)}>{label}</label>
            <Input id={fieldId(label)} />
          </div>
        ))}
        {['Description', 'Notes for reviewers'].map((label) => (
          <div key={label} style={FIELD_STYLE}>
            <label htmlFor={fieldId(label)}>{label}</label>
            <Textarea id={fieldId(label)} rows={6} />
          </div>
        ))}
        <DialogFooter>
          <DialogClose render={<Button intent="ghost">Cancel</Button>} />
          <Button>Create pillar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
  parameters: { chromatic: { viewports: [375] } },
};

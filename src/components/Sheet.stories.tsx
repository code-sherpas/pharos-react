import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from './Sheet';
import { Button } from './Button';

/**
 * `Sheet` is a **modal** panel docked to a viewport edge (Decision D18). It
 * wraps Base UI's `Dialog` — focus trap, scroll lock, backdrop, Escape /
 * backdrop-click dismiss, focus return to the trigger. Distinct from
 * `Popover` (non-modal, anchored) and `DropdownMenu` (menu-button).
 *
 * The `side` axis docks it to `right` (default), `left`, `top` or `bottom`.
 */
const meta: Meta<typeof Sheet> = {
  title: 'Components/Sheet',
  component: Sheet,
};

export default meta;
type Story = StoryObj<typeof meta>;

function DemoContent({ side }: { side: string }) {
  return (
    <SheetContent side={side as never}>
      <SheetHeader>
        <SheetTitle>Edit profile</SheetTitle>
        <SheetDescription>Make changes to your profile here.</SheetDescription>
      </SheetHeader>
      <p>Panel body content goes here.</p>
      <SheetFooter>
        <SheetClose render={<Button intent="ghost">Cancel</Button>} />
        <SheetClose render={<Button>Save</Button>} />
      </SheetFooter>
    </SheetContent>
  );
}

/** Interactive: click the trigger to open the default (right) sheet. */
export const Default: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger render={<Button intent="secondary">Open sheet</Button>} />
      <DemoContent side="right" />
    </Sheet>
  ),
};

/** `defaultOpen` so Chromatic captures the docked panel + backdrop. */
export const Right: Story = {
  render: () => (
    <Sheet defaultOpen>
      <SheetTrigger render={<Button intent="secondary">Open</Button>} />
      <DemoContent side="right" />
    </Sheet>
  ),
};

export const Left: Story = {
  render: () => (
    <Sheet defaultOpen>
      <SheetTrigger render={<Button intent="secondary">Open</Button>} />
      <DemoContent side="left" />
    </Sheet>
  ),
};

export const Top: Story = {
  render: () => (
    <Sheet defaultOpen>
      <SheetTrigger render={<Button intent="secondary">Open</Button>} />
      <DemoContent side="top" />
    </Sheet>
  ),
};

export const Bottom: Story = {
  render: () => (
    <Sheet defaultOpen>
      <SheetTrigger render={<Button intent="secondary">Open</Button>} />
      <DemoContent side="bottom" />
    </Sheet>
  ),
};

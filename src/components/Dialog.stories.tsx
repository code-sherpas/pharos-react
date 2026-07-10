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

/**
 * `Dialog` is a **centered** modal panel (Decision D19). It wraps Base UI's
 * `Dialog` — focus trap, scroll lock, backdrop, Escape / backdrop-click
 * dismiss, focus return to the trigger. Sibling of `Sheet` (edge-docked);
 * distinct from `Popover` (non-modal, anchored) and `DropdownMenu`
 * (menu-button).
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

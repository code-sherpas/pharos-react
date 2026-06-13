import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverTitle,
  PopoverDescription,
  PopoverClose,
} from './Popover';
import { Button } from './Button';
import { IconButton } from './IconButton';
import { Separator } from './Separator';

/* Inline SVGs in the shape Lucide ships (24x24 viewBox, currentColor).
 * Pharos demos do not pull Lucide as a peer dep just for stories (D4
 * names Lucide as the canonical library for consumers). */

const UserIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const SIDES = ['top', 'bottom', 'left', 'right'] as const;

const meta: Meta<typeof Popover> = {
  title: 'Components/Popover',
  component: Popover,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Free-form content anchored to a trigger (D16). Implements the ARIA dialog pattern as ' +
          'a non-modal disclosure via Base UI (`role="dialog"`, focus moves into the popup on open ' +
          'and returns to the trigger on close, Escape and outside-click dismiss it, focus is NOT ' +
          'trapped). Distinct from DropdownMenu, which carries a list of commands under the ' +
          'menu-button contract — 7 of 8 surveyed design systems separate the two. Compound parts ' +
          'mirror shadcn naming; the Trigger composes any control via `render`.',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof Popover>;

/** The canonical case: an account panel opened from an IconButton trigger,
 * with a title, description, a divider and actions. This mirrors the
 * Alexandria MobileHeader user panel the adoption will replace. */
export const Playground: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger
        render={
          <IconButton aria-label="Account">
            <UserIcon />
          </IconButton>
        }
      />
      <PopoverContent>
        <PopoverTitle>Ada Lovelace</PopoverTitle>
        <PopoverDescription>ada@example.com</PopoverDescription>
        <Separator style={{ margin: 'var(--pharos-spacing-3) 0' }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--pharos-spacing-2)' }}>
          <Button intent="ghost" size="sm" style={{ justifyContent: 'flex-start' }}>
            View profile
          </Button>
          <PopoverClose
            render={
              <Button intent="ghost" size="sm" style={{ justifyContent: 'flex-start' }}>
                Sign out
              </Button>
            }
          />
        </div>
      </PopoverContent>
    </Popover>
  ),
};

export const Default: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger render={<Button intent="secondary">Open popover</Button>} />
      <PopoverContent>
        <PopoverTitle>Popover title</PopoverTitle>
        <PopoverDescription>
          A popover holds arbitrary content under the dialog contract — text, forms or controls.
        </PopoverDescription>
      </PopoverContent>
    </Popover>
  ),
};

/** Title + description wire `aria-labelledby` / `aria-describedby` on the
 * dialog, giving it an accessible name and description. */
export const WithTitleAndDescription: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger render={<Button intent="secondary">Details</Button>} />
      <PopoverContent>
        <PopoverTitle>Keyboard shortcuts</PopoverTitle>
        <PopoverDescription>
          Press ⌘K to open the command palette, or Esc to dismiss this panel.
        </PopoverDescription>
      </PopoverContent>
    </Popover>
  ),
};

/** A popover with an interactive form — the kind of free-form content that
 * belongs in a Popover, not a DropdownMenu. */
export const WithForm: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger render={<Button intent="secondary">Add label</Button>} />
      <PopoverContent>
        <PopoverTitle>New label</PopoverTitle>
        <form
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--pharos-spacing-3)',
            marginTop: 'var(--pharos-spacing-3)',
          }}
          onSubmit={(e) => e.preventDefault()}
        >
          <input
            aria-label="Label name"
            placeholder="Label name"
            style={{
              padding: 'var(--pharos-spacing-2)',
              border: '1px solid var(--pharos-color-neutral-300)',
              borderRadius: 'var(--pharos-radius-sm)',
              font: 'inherit',
            }}
          />
          <div
            style={{ display: 'flex', gap: 'var(--pharos-spacing-2)', justifyContent: 'flex-end' }}
          >
            <PopoverClose
              render={
                <Button intent="ghost" size="sm">
                  Cancel
                </Button>
              }
            />
            <PopoverClose
              render={
                <Button intent="primary" size="sm">
                  Save
                </Button>
              }
            />
          </div>
        </form>
      </PopoverContent>
    </Popover>
  ),
};

/** `side` controls which edge of the trigger the popover opens from. */
export const Sides: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '4rem',
        placeItems: 'center',
        minHeight: '100vh',
        padding: '4rem',
      }}
    >
      {SIDES.map((side) => (
        <Popover key={side}>
          <PopoverTrigger render={<Button intent="secondary">{`side="${side}"`}</Button>} />
          <PopoverContent side={side}>
            <PopoverTitle>{`Opens on ${side}`}</PopoverTitle>
            <PopoverDescription>Centred on the trigger, 8px away.</PopoverDescription>
          </PopoverContent>
        </Popover>
      ))}
    </div>
  ),
};

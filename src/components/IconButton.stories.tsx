import { Fragment } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { IconButton } from './IconButton';

/* Inline SVGs in the shape Lucide ships (24x24 viewBox, currentColor stroke).
 * The repo does not bundle Lucide as a dependency — Decision D4 names Lucide
 * as the canonical icon library for *consumers*, and Pharos demos do not
 * pull a peer dep just for stories. Identical visual outcome. */

const XIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
);

const ChevronLeftIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="m15 18-6-6 6-6" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="m9 18 6-6-6-6" />
  </svg>
);

const TrashIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M3 6h18" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
    <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

const PencilIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" />
    <path d="m15 5 4 4" />
  </svg>
);

const SendIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z" />
    <path d="m21.854 2.147-10.94 10.939" />
  </svg>
);

const INTENTS = ['primary', 'secondary', 'ghost', 'destructive'] as const;
const SIZES = ['sm', 'md', 'lg'] as const;

const meta: Meta<typeof IconButton> = {
  title: 'Components/IconButton',
  component: IconButton,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Icon-only pressable control. Atom dedicated (D13) instead of a `Button` variant — ' +
          'allows enforcing `aria-label` (or `aria-labelledby`) at the type level (WCAG 4.1.2) ' +
          'and matches the state-of-the-art convention in MUI / Chakra / Mantine / Radix Themes / ' +
          'Carbon / Material 3.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    intent: {
      control: 'inline-radio',
      options: INTENTS,
      description: 'Visual emphasis. Mirrors the Button intent vocabulary.',
      table: { defaultValue: { summary: 'ghost' } },
    },
    size: {
      control: 'inline-radio',
      options: SIZES,
      description: 'Square dimensions matching the Button height grid (32 / 40 / 48 px).',
      table: { defaultValue: { summary: 'md' } },
    },
    isLoading: {
      control: 'boolean',
      description: 'Swaps the icon for a Spinner of matching size and disables the button.',
      table: { defaultValue: { summary: 'false' } },
    },
    disabled: {
      control: 'boolean',
    },
    'aria-label': {
      control: 'text',
      description: 'Accessible name. Required at the type level (or use aria-labelledby).',
    },
    children: {
      control: false,
    },
  },
  args: {
    intent: 'ghost',
    size: 'md',
    isLoading: false,
    disabled: false,
    'aria-label': 'Close',
    children: <XIcon />,
  },
};

export default meta;

type Story = StoryObj<typeof IconButton>;

export const Playground: Story = {};

export const Default: Story = {};

export const Intents: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
      <IconButton intent="primary" aria-label="Send">
        <SendIcon />
      </IconButton>
      <IconButton intent="secondary" aria-label="Previous page">
        <ChevronLeftIcon />
      </IconButton>
      <IconButton intent="ghost" aria-label="Close">
        <XIcon />
      </IconButton>
      <IconButton intent="destructive" aria-label="Delete">
        <TrashIcon />
      </IconButton>
    </div>
  ),
};

export const Sizes: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
      {SIZES.map((size) => (
        <div
          key={size}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <IconButton size={size} aria-label={`Edit (${size})`}>
            <PencilIcon />
          </IconButton>
          <span className="storybook-matrix-label">{size}</span>
        </div>
      ))}
    </div>
  ),
};

export const Loading: Story = {
  name: 'Loading state',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'Setting `isLoading` swaps the icon for a `<Spinner>` of matching size, disables the ' +
          'button (so the action cannot fire mid-flight) and exposes `aria-busy="true"` for ' +
          'screen readers.',
      },
    },
  },
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
      <IconButton intent="primary" aria-label="Saving" isLoading>
        <SendIcon />
      </IconButton>
      <IconButton intent="secondary" aria-label="Saving" isLoading>
        <PencilIcon />
      </IconButton>
      <IconButton intent="ghost" aria-label="Closing" isLoading>
        <XIcon />
      </IconButton>
      <IconButton intent="destructive" aria-label="Deleting" isLoading>
        <TrashIcon />
      </IconButton>
    </div>
  ),
};

export const RenderAsLink: Story = {
  name: 'Composition: render as <a>',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'The `render` prop composes the IconButton as a different element while keeping its ' +
          'styles. Use this for circle navigation buttons inside a router (`render={<Link to="/next" />}`).',
      },
    },
  },
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
      <IconButton intent="secondary" aria-label="Previous page" render={<a href="#previous" />}>
        <ChevronLeftIcon />
      </IconButton>
      <IconButton intent="secondary" aria-label="Next page" render={<a href="#next" />}>
        <ChevronRightIcon />
      </IconButton>
    </div>
  ),
};

export const Matrix: Story = {
  parameters: {
    controls: { disable: true },
    actions: { disable: true },
    layout: 'padded',
  },
  render: () => (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'auto repeat(3, 96px)',
        alignItems: 'center',
        gap: '1rem',
      }}
    >
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
            <IconButton
              key={`${intent}-${size}`}
              intent={intent}
              size={size}
              aria-label={`${intent} ${size}`}
            >
              <XIcon />
            </IconButton>
          ))}
        </Fragment>
      ))}
    </div>
  ),
};

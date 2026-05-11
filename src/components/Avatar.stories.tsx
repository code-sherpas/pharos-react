import { Fragment } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Avatar, AvatarImage, AvatarFallback, AvatarGroup } from './Avatar';

/* Inline Lucide-shaped icons for fallback demos. Same convention as
 * IconButton.stories.tsx — Pharos does not pull lucide-react as a
 * dependency just for stories. */

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

const BuildingIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M9 22V12h6v10" />
    <path d="M9 7h0" />
    <path d="M15 7h0" />
  </svg>
);

const SIZES = ['sm', 'md', 'lg'] as const;
const SHAPES = ['circle', 'square'] as const;

// Stable demo URLs. Picsum returns a deterministic seeded photo for
// each path so the Chromatic baseline does not drift between snapshots.
const HEADSHOT_A = 'https://i.pravatar.cc/96?img=12';
const HEADSHOT_B = 'https://i.pravatar.cc/96?img=32';
const HEADSHOT_C = 'https://i.pravatar.cc/96?img=47';
const HEADSHOT_D = 'https://i.pravatar.cc/96?img=58';
const HEADSHOT_E = 'https://i.pravatar.cc/96?img=68';

const meta: Meta<typeof Avatar> = {
  title: 'Components/Avatar',
  component: Avatar,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Compound avatar atom (D14). Composes `Avatar` + `AvatarImage` + `AvatarFallback` + ' +
          '`AvatarGroup`. Named sizes (sm/md/lg = 32/40/48 px) align with the IconButton grid; ' +
          '`size={number}` writes one-off `width`/`height` inline for profile-picture or compact ' +
          'stack avatars. State-of-the-art aligned: 8/10 top-tier DS ship Avatar as a dedicated ' +
          'atom; Pharos picks the shadcn/Radix/Base UI compound shape with explicit Fallback ' +
          'composition (Escuela 1, D11).',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'inline-radio',
      options: SIZES,
      description:
        'Avatar dimensions. Named sizes align with the IconButton / Button height grid. Use ' +
        '`size={number}` (e.g. `108`) for one-off custom sizes outside the canonical scale.',
      table: { defaultValue: { summary: 'md' } },
    },
    shape: {
      control: 'inline-radio',
      options: SHAPES,
      description:
        'Border-radius family. `circle` is the dominant pattern for people; `square` reads as ' +
        'an org or product avatar (radius matches the Card token family).',
      table: { defaultValue: { summary: 'circle' } },
    },
    children: { control: false },
  },
  args: {
    size: 'md',
    shape: 'circle',
  },
};

export default meta;

type Story = StoryObj<typeof Avatar>;

export const Playground: Story = {
  render: (args) => (
    <Avatar {...args}>
      <AvatarImage src={HEADSHOT_A} alt="Ada Lovelace" />
      <AvatarFallback>AL</AvatarFallback>
    </Avatar>
  ),
};

export const Default: Story = {
  render: (args) => (
    <Avatar {...args}>
      <AvatarImage src={HEADSHOT_A} alt="Ada Lovelace" />
      <AvatarFallback>AL</AvatarFallback>
    </Avatar>
  ),
};

export const Sizes: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
      {SIZES.map((size) => (
        <div
          key={size}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}
        >
          <Avatar size={size}>
            <AvatarImage src={HEADSHOT_A} alt="Ada Lovelace" />
            <AvatarFallback>AL</AvatarFallback>
          </Avatar>
          <span className="storybook-matrix-label">{size}</span>
        </div>
      ))}
      <div
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}
      >
        <Avatar size={108}>
          <AvatarImage src="https://i.pravatar.cc/216?img=12" alt="Ada Lovelace" />
          <AvatarFallback>AL</AvatarFallback>
        </Avatar>
        <span className="storybook-matrix-label">108 (numeric)</span>
      </div>
    </div>
  ),
};

export const Shapes: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
      <div
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}
      >
        <Avatar shape="circle">
          <AvatarImage src={HEADSHOT_A} alt="Ada Lovelace" />
          <AvatarFallback>AL</AvatarFallback>
        </Avatar>
        <span className="storybook-matrix-label">circle (person)</span>
      </div>
      <div
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}
      >
        <Avatar shape="square">
          <AvatarFallback>
            <BuildingIcon />
          </AvatarFallback>
        </Avatar>
        <span className="storybook-matrix-label">square (org)</span>
      </div>
    </div>
  ),
};

export const Fallbacks: Story = {
  name: 'Fallback chain',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'Fallback composes whatever the consumer renders: initials, an icon, or a default ' +
          'placeholder image. The atom does not bake a magic `name` prop — composition stays ' +
          'explicit (Escuela 1, D11). The fallback hides automatically once `AvatarImage` ' +
          'reports `loaded`.',
      },
    },
  },
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
      <div
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}
      >
        <Avatar>
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
        <span className="storybook-matrix-label">Initials only</span>
      </div>
      <div
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}
      >
        <Avatar>
          <AvatarFallback>
            <UserIcon />
          </AvatarFallback>
        </Avatar>
        <span className="storybook-matrix-label">Icon</span>
      </div>
      <div
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}
      >
        <Avatar>
          <AvatarImage src="https://invalid.example/missing.jpg" alt="" />
          <AvatarFallback>FB</AvatarFallback>
        </Avatar>
        <span className="storybook-matrix-label">Image fails → initials</span>
      </div>
    </div>
  ),
};

export const Group: Story = {
  name: 'AvatarGroup with overflow',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'Stack overlapping avatars and cap the visible count with `max`. The surplus collapses ' +
          'into a final `+N` avatar that reads the same accessible name (`{N} more`).',
      },
    },
  },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <AvatarGroup size="sm">
        <Avatar>
          <AvatarImage src={HEADSHOT_A} alt="Ada" />
          <AvatarFallback>AL</AvatarFallback>
        </Avatar>
        <Avatar>
          <AvatarImage src={HEADSHOT_B} alt="Grace" />
          <AvatarFallback>GH</AvatarFallback>
        </Avatar>
        <Avatar>
          <AvatarImage src={HEADSHOT_C} alt="Margaret" />
          <AvatarFallback>MH</AvatarFallback>
        </Avatar>
      </AvatarGroup>
      <AvatarGroup size="md" max={3}>
        <Avatar>
          <AvatarImage src={HEADSHOT_A} alt="Ada" />
          <AvatarFallback>AL</AvatarFallback>
        </Avatar>
        <Avatar>
          <AvatarImage src={HEADSHOT_B} alt="Grace" />
          <AvatarFallback>GH</AvatarFallback>
        </Avatar>
        <Avatar>
          <AvatarImage src={HEADSHOT_C} alt="Margaret" />
          <AvatarFallback>MH</AvatarFallback>
        </Avatar>
        <Avatar>
          <AvatarImage src={HEADSHOT_D} alt="Joan" />
          <AvatarFallback>JC</AvatarFallback>
        </Avatar>
        <Avatar>
          <AvatarImage src={HEADSHOT_E} alt="Karen" />
          <AvatarFallback>KS</AvatarFallback>
        </Avatar>
      </AvatarGroup>
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
          'The `render` prop composes the Avatar root as a different element while keeping its ' +
          'styles. Useful when an avatar acts as a profile link inside a router.',
      },
    },
  },
  render: () => (
    <Avatar render={<a href="#profile" />}>
      <AvatarImage src={HEADSHOT_A} alt="Ada Lovelace" />
      <AvatarFallback>AL</AvatarFallback>
    </Avatar>
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
      {SHAPES.map((shape) => (
        <Fragment key={shape}>
          <span className="storybook-matrix-label-row">{shape}</span>
          {SIZES.map((size) => (
            <Avatar key={`${shape}-${size}`} size={size} shape={shape}>
              <AvatarImage src={HEADSHOT_A} alt="Ada Lovelace" />
              <AvatarFallback>AL</AvatarFallback>
            </Avatar>
          ))}
        </Fragment>
      ))}
    </div>
  ),
};

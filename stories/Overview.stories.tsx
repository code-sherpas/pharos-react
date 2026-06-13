import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from '../src/components/Button';
import { Badge } from '../src/components/Badge';
import { Input } from '../src/components/Input';
import { Separator } from '../src/components/Separator';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '../src/components/Card';
import { Textarea } from '../src/components/Textarea';
import { Spinner } from '../src/components/Spinner';
import { IconButton } from '../src/components/IconButton';
import { Avatar, AvatarImage, AvatarFallback, AvatarGroup } from '../src/components/Avatar';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '../src/components/DropdownMenu';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverTitle,
  PopoverDescription,
} from '../src/components/Popover';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '../src/components/Select';
import {
  Combobox,
  ComboboxControl,
  ComboboxInput,
  ComboboxTrigger,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
} from '../src/components/Combobox';

/**
 * Multi-component gallery. One story per published component family, grouped
 * by atomic-design category. Lives under `stories/` so it never enters the
 * library bundle (Vite library mode uses `src/index.ts` as its only entry —
 * see PLAN-pharos-alexandria.md §1B.4 "Galería de overview").
 *
 * Two purposes:
 *   1. Single page where humans can eyeball every component side by side.
 *   2. Single Chromatic snapshot that fails the visual diff if any component
 *      shifts pixels — catches cross-component regressions that a per-story
 *      snapshot would miss.
 *
 * Each new atom in Phase 2 must add a Showcase entry to the matching section
 * (see checklist 2.X.3 in the master plan).
 */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="storybook-overview-section">
      <h2 className="storybook-overview-section-title">{title}</h2>
      <div className="storybook-overview-section-body">{children}</div>
    </section>
  );
}

function Showcase({ name, children }: { name: string; children: React.ReactNode }) {
  return (
    <article className="storybook-overview-showcase">
      <h3 className="storybook-overview-showcase-title">{name}</h3>
      <div className="storybook-overview-showcase-body">{children}</div>
    </article>
  );
}

function ButtonShowcase() {
  return (
    <div className="storybook-overview-row">
      <Button intent="primary">Primary</Button>
      <Button intent="secondary">Secondary</Button>
      <Button intent="ghost">Ghost</Button>
      <Button intent="destructive">Destructive</Button>
      <Button intent="primary" disabled>
        Disabled
      </Button>
    </div>
  );
}

function BadgeShowcase() {
  return (
    <div className="storybook-overview-row">
      <Badge variant="default">Default</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="destructive">Destructive</Badge>
      <Badge variant="outline">Outline</Badge>
      <Badge variant="success">Success</Badge>
      <Badge variant="warning">Warning</Badge>
      <Badge variant="info">Info</Badge>
    </div>
  );
}

function InputShowcase() {
  return (
    <div className="storybook-overview-row" style={{ gap: '0.75rem' }}>
      <Input aria-label="default" placeholder="Default" style={{ width: 200 }} />
      <Input aria-label="readonly" readOnly defaultValue="Read-only" style={{ width: 200 }} />
      <Input
        aria-label="invalid"
        aria-invalid="true"
        defaultValue="invalid@"
        style={{ width: 200 }}
      />
      <Input aria-label="disabled" disabled placeholder="Disabled" style={{ width: 200 }} />
    </div>
  );
}

function CardShowcase() {
  return (
    <div className="storybook-overview-row" style={{ alignItems: 'stretch', gap: '0.75rem' }}>
      {(['default', 'elevated', 'outlined'] as const).map((variant) => (
        <Card key={variant} variant={variant} style={{ width: 200 }}>
          <CardHeader>
            <CardTitle style={{ textTransform: 'capitalize' }}>{variant}</CardTitle>
            <CardDescription>Variant {variant}</CardDescription>
          </CardHeader>
          <CardContent>
            <p style={{ margin: 0, fontSize: 'var(--pharos-font-size-sm)' }}>
              Body content sample.
            </p>
          </CardContent>
          <CardFooter>
            <Button intent="ghost" size="sm">
              Action
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}

function TextareaShowcase() {
  return (
    <div className="storybook-overview-row" style={{ gap: '0.75rem', alignItems: 'flex-start' }}>
      <Textarea aria-label="default" placeholder="Default" style={{ width: 200 }} rows={3} />
      <Textarea
        aria-label="readonly"
        readOnly
        defaultValue="Read-only content"
        style={{ width: 200 }}
        rows={3}
      />
      <Textarea
        aria-label="invalid"
        aria-invalid="true"
        defaultValue="invalid@"
        style={{ width: 200 }}
        rows={3}
      />
      <Textarea
        aria-label="disabled"
        disabled
        placeholder="Disabled"
        style={{ width: 200 }}
        rows={3}
      />
    </div>
  );
}

function SpinnerShowcase() {
  return (
    <div className="storybook-overview-row" style={{ gap: '1.5rem', alignItems: 'center' }}>
      <Spinner size="sm" />
      <Spinner size="md" />
      <Spinner size="lg" />
    </div>
  );
}

const CloseGlyph = () => (
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

function IconButtonShowcase() {
  return (
    <div className="storybook-overview-row" style={{ gap: '0.75rem', alignItems: 'center' }}>
      <IconButton intent="primary" aria-label="Send (primary)">
        <CloseGlyph />
      </IconButton>
      <IconButton intent="secondary" aria-label="Close (secondary)">
        <CloseGlyph />
      </IconButton>
      <IconButton intent="ghost" aria-label="Close (ghost)">
        <CloseGlyph />
      </IconButton>
      <IconButton intent="destructive" aria-label="Delete (destructive)">
        <CloseGlyph />
      </IconButton>
      <IconButton intent="ghost" aria-label="Saving" isLoading>
        <CloseGlyph />
      </IconButton>
    </div>
  );
}

function AvatarShowcase() {
  return (
    <div className="storybook-overview-row" style={{ gap: '1.25rem', alignItems: 'center' }}>
      <Avatar>
        <AvatarImage src="https://i.pravatar.cc/96?img=12" alt="Ada Lovelace" />
        <AvatarFallback>AL</AvatarFallback>
      </Avatar>
      <Avatar shape="square">
        <AvatarFallback>
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
          </svg>
        </AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>
      <AvatarGroup size="sm" max={3}>
        <Avatar>
          <AvatarImage src="https://i.pravatar.cc/96?img=32" alt="Grace" />
          <AvatarFallback>GH</AvatarFallback>
        </Avatar>
        <Avatar>
          <AvatarImage src="https://i.pravatar.cc/96?img=47" alt="Margaret" />
          <AvatarFallback>MH</AvatarFallback>
        </Avatar>
        <Avatar>
          <AvatarImage src="https://i.pravatar.cc/96?img=58" alt="Joan" />
          <AvatarFallback>JC</AvatarFallback>
        </Avatar>
        <Avatar>
          <AvatarImage src="https://i.pravatar.cc/96?img=68" alt="Karen" />
          <AvatarFallback>KS</AvatarFallback>
        </Avatar>
      </AvatarGroup>
    </div>
  );
}

function SeparatorShowcase() {
  return (
    <div
      className="storybook-overview-row"
      style={{ flexDirection: 'column', alignItems: 'stretch', gap: '0.5rem', width: 320 }}
    >
      <span style={{ fontSize: 'var(--pharos-font-size-sm)' }}>Section A</span>
      <Separator />
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', height: 24 }}>
        <span style={{ fontSize: 'var(--pharos-font-size-sm)' }}>Left</span>
        <Separator orientation="vertical" />
        <span style={{ fontSize: 'var(--pharos-font-size-sm)' }}>Right</span>
      </div>
      <Separator decorative={false} />
      <span style={{ fontSize: 'var(--pharos-font-size-sm)' }}>Section B</span>
    </div>
  );
}

function DropdownMenuShowcase() {
  // Overlays render through a Portal, so the gallery shows the trigger at
  // rest — the open menu (items, destructive tone, sides) lives in the
  // dedicated DropdownMenu stories that Chromatic snapshots individually.
  return (
    <div className="storybook-overview-row" style={{ gap: '0.75rem', alignItems: 'center' }}>
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button intent="secondary">Actions</Button>} />
        <DropdownMenuContent>
          <DropdownMenuItem>Rename</DropdownMenuItem>
          <DropdownMenuItem>Duplicate</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function PopoverShowcase() {
  // Overlays render through a Portal, so the gallery shows the trigger at
  // rest — the open panel (title, description, sides) lives in the dedicated
  // Popover stories that Chromatic snapshots individually.
  return (
    <div className="storybook-overview-row" style={{ gap: '0.75rem', alignItems: 'center' }}>
      <Popover>
        <PopoverTrigger render={<Button intent="secondary">Open popover</Button>} />
        <PopoverContent>
          <PopoverTitle>Popover title</PopoverTitle>
          <PopoverDescription>Free-form content under the dialog contract.</PopoverDescription>
        </PopoverContent>
      </Popover>
    </div>
  );
}

const VISIBILITY = { private: 'Private', organization: 'Organization', public: 'Public' };

function SelectShowcase() {
  // Overlays render through a Portal, so the gallery shows the trigger at
  // rest with a resolved value — the open listbox lives in the dedicated
  // Select stories. `items` is what resolves the trigger label (Base UI
  // contract); a controlled/preset value without it would show the raw value.
  return (
    <div className="storybook-overview-row" style={{ gap: '0.75rem', alignItems: 'center' }}>
      <Select items={VISIBILITY} defaultValue="organization">
        <SelectTrigger aria-label="Visibility" style={{ width: 200 }}>
          <SelectValue placeholder="Select visibility" />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(VISIBILITY).map(([value, label]) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

const COMBOBOX_FRUITS = ['Apple', 'Banana', 'Cherry', 'Mango'];

function ComboboxShowcase() {
  // Shown at rest (popup portaled); the open list + multi-select chips live in
  // the dedicated Combobox stories.
  return (
    <div className="storybook-overview-row" style={{ gap: '0.75rem', alignItems: 'center' }}>
      <Combobox items={COMBOBOX_FRUITS}>
        <ComboboxControl style={{ width: 200 }}>
          <ComboboxInput placeholder="Search fruit…" aria-label="Fruit" />
          <ComboboxTrigger aria-label="Open" />
        </ComboboxControl>
        <ComboboxContent>
          <ComboboxList>
            {(item: string) => (
              <ComboboxItem key={item} value={item}>
                {item}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </div>
  );
}

function Overview() {
  return (
    <div className="storybook-overview">
      <header className="storybook-overview-header">
        <h1 className="storybook-overview-title">Pharos components</h1>
        <p className="storybook-overview-subtitle">
          Every component currently published in <code>@code-sherpas/pharos-react</code>, grouped by
          atomic-design category. Updated on every Phase 2 PR.
        </p>
      </header>

      <Section title="Primitives">
        <Showcase name="Button">
          <ButtonShowcase />
        </Showcase>
        <Showcase name="Badge">
          <BadgeShowcase />
        </Showcase>
        <Showcase name="Input">
          <InputShowcase />
        </Showcase>
        <Showcase name="Textarea">
          <TextareaShowcase />
        </Showcase>
        <Showcase name="Separator">
          <SeparatorShowcase />
        </Showcase>
        <Showcase name="Card">
          <CardShowcase />
        </Showcase>
        <Showcase name="Spinner">
          <SpinnerShowcase />
        </Showcase>
        <Showcase name="IconButton">
          <IconButtonShowcase />
        </Showcase>
        <Showcase name="Avatar">
          <AvatarShowcase />
        </Showcase>
        <Showcase name="DropdownMenu">
          <DropdownMenuShowcase />
        </Showcase>
        <Showcase name="Popover">
          <PopoverShowcase />
        </Showcase>
        <Showcase name="Select">
          <SelectShowcase />
        </Showcase>
        <Showcase name="Combobox">
          <ComboboxShowcase />
        </Showcase>
      </Section>
    </div>
  );
}

const meta: Meta<typeof Overview> = {
  title: 'Pharos/Overview',
  component: Overview,
  parameters: {
    layout: 'fullscreen',
    a11y: { test: 'todo' },
  },
};

export default meta;

type Story = StoryObj<typeof Overview>;

export const Gallery: Story = {};

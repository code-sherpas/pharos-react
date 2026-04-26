import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from '../src/components/Button';

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

import type { Meta, StoryObj } from '@storybook/react-vite';
import { tokens } from '@code-sherpas/pharos-tokens';

type Entry<T> = { key: string; value: T };

function entries<T>(obj: Record<string, T>): Entry<T>[] {
  return Object.entries(obj).map(([key, value]) => ({ key, value }));
}

function Swatch({ label, cssVar, value }: { label: string; cssVar: string; value: string }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        fontFamily: 'system-ui, sans-serif',
        fontSize: 12,
      }}
    >
      <div
        style={{
          width: '100%',
          height: 64,
          borderRadius: 8,
          background: `var(${cssVar})`,
          border: '1px solid rgba(0,0,0,0.08)',
        }}
      />
      <div style={{ fontWeight: 600 }}>{label}</div>
      <code style={{ color: '#6b6b6b' }}>{value}</code>
      <code style={{ color: '#6b6b6b' }}>{cssVar}</code>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 48 }}>
      <h2 style={{ fontFamily: 'system-ui, sans-serif', fontSize: 20, marginBottom: 16 }}>
        {title}
      </h2>
      {children}
    </section>
  );
}

function ColorGrid({
  group,
  family,
}: {
  group: 'base' | 'neutral' | 'primary';
  family: Record<string, string>;
}) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
        gap: 20,
      }}
    >
      {entries(family).map(({ key, value }) => (
        <Swatch
          key={key}
          label={`${group}.${key}`}
          cssVar={`--pharos-color-${group}-${key}`}
          value={value}
        />
      ))}
    </div>
  );
}

function SemanticGrid() {
  const groups = tokens.color.semantic as Record<string, Record<string, string>>;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {entries(groups).map(({ key: group, value: roles }) => (
        <div key={group}>
          <h3 style={{ fontFamily: 'system-ui, sans-serif', fontSize: 16, marginBottom: 8 }}>
            {group}
          </h3>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
              gap: 20,
            }}
          >
            {entries(roles).map(({ key: role, value }) => (
              <Swatch
                key={role}
                label={`${group}.${role}`}
                cssVar={`--pharos-color-semantic-${group}-${role}`}
                value={value}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function ScaleList({
  family,
  prefix,
}: {
  family: Record<string, string | number>;
  prefix: string;
}) {
  return (
    <table
      style={{
        width: '100%',
        maxWidth: 640,
        borderCollapse: 'collapse',
        fontFamily: 'system-ui, sans-serif',
        fontSize: 14,
      }}
    >
      <thead>
        <tr>
          <th style={{ textAlign: 'left', padding: '8px 12px' }}>Token</th>
          <th style={{ textAlign: 'left', padding: '8px 12px' }}>Value</th>
          <th style={{ textAlign: 'left', padding: '8px 12px' }}>CSS var</th>
        </tr>
      </thead>
      <tbody>
        {entries(family).map(({ key, value }) => (
          <tr key={key} style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}>
            <td style={{ padding: '8px 12px', fontWeight: 600 }}>{key}</td>
            <td style={{ padding: '8px 12px' }}>
              <code>{String(value)}</code>
            </td>
            <td style={{ padding: '8px 12px' }}>
              <code>
                --pharos-{prefix}-{key}
              </code>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function TokensGallery() {
  return (
    <div style={{ padding: 24, maxWidth: 1024 }}>
      <p
        style={{
          fontFamily: 'system-ui, sans-serif',
          fontSize: 14,
          marginBottom: 32,
          color: '#6b6b6b',
        }}
      >
        Every value below is read directly from
        <code> @code-sherpas/pharos-tokens </code>
        at render time. If you see something wrong here, the fix goes in the tokens repo, not this
        page.
      </p>

      <Section title="Base">
        <ColorGrid group="base" family={tokens.color.base} />
      </Section>

      <Section title="Neutral">
        <ColorGrid group="neutral" family={tokens.color.neutral} />
      </Section>

      <Section title="Primary">
        <ColorGrid group="primary" family={tokens.color.primary} />
      </Section>

      <Section title="Semantic">
        <SemanticGrid />
      </Section>

      <Section title="Radius">
        <ScaleList family={tokens.radius} prefix="radius" />
      </Section>

      <Section title="Spacing">
        <ScaleList family={tokens.spacing} prefix="spacing" />
      </Section>
    </div>
  );
}

const meta: Meta<typeof TokensGallery> = {
  title: 'Pharos/Tokens',
  component: TokensGallery,
  parameters: {
    layout: 'fullscreen',
    a11y: { test: 'off' },
  },
};

export default meta;

type Story = StoryObj<typeof TokensGallery>;

export const Gallery: Story = {};

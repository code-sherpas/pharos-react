import type { Preview } from '@storybook/react-vite';

// pharos-tokens defines the `--pharos-*` CSS variables that every component
// in pharos-react resolves at runtime. Importing it here mirrors what a real
// consumer must do once at their app entry — see RULES.md §3.
import '@code-sherpas/pharos-tokens/css';

// Storybook-only utility classes used by stories that need layout helpers
// (e.g. the Button Matrix). Outside src/ so the published bundle never
// carries them. See Decision D9 — the library bundle is pure CSS Modules.
import './preview.css';

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: 'surface',
      values: [
        { name: 'surface', value: 'var(--pharos-color-base-white)' },
        { name: 'neutral-50', value: 'var(--pharos-color-neutral-50)' },
        { name: 'neutral-900', value: 'var(--pharos-color-neutral-900)' },
      ],
    },
    a11y: {
      test: 'todo',
    },
  },
  tags: ['autodocs'],
};

export default preview;

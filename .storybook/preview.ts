import type { Preview } from '@storybook/react-vite';

// pharos-tokens defines the `--pharos-*` CSS variables that every component
// in pharos-react resolves at runtime. Importing it here mirrors what a real
// consumer must do once at their app entry — see RULES.md §3.
import '@code-sherpas/pharos-tokens/css';

// Self-host the fonts that the D8 stack expects (`Outfit, Inter, system-ui,
// ...`). The `@fontsource/*` packages bundle the woff2 files locally and
// declare matching `@font-face` rules — no network round-trip to Google
// Fonts, no race condition between font load and Chromatic's snapshot
// capture. This is Storybook-only: the published bundle stays
// framework-agnostic and continues to declare font loading as the
// consumer's responsibility (D8 + RULES.md §8).
import '@fontsource/outfit/400.css';
import '@fontsource/outfit/500.css';
import '@fontsource/outfit/600.css';
import '@fontsource/outfit/700.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';

// Storybook-only utility classes used by stories that need layout helpers
// (e.g. the Button Matrix). Outside src/ so the published bundle never
// carries them. See Decision D9 — the library bundle is pure CSS Modules.
import './preview.css';

const preview: Preview = {
  // Wait for declared web fonts to finish loading before any story renders.
  // Storybook calls loaders before mounting the component, so a story
  // (and Chromatic's snapshot of it) never paints with the system fallback
  // by accident. Without this, Chromatic was capturing the cap-block at
  // a slightly different vertical position than the rendered Storybook
  // because the snapshot fired before Outfit settled in.
  loaders: [
    async () => {
      if (typeof document !== 'undefined' && document.fonts?.ready) {
        await document.fonts.ready;
      }
      return {};
    },
  ],
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
      // 'error' makes axe violations fail the story test under
      // `pnpm test:storybook` (addon-vitest + Playwright). This is only
      // meaningful because that runner exists — before it, the parameter
      // was inert (nothing rendered the stories to scan them).
      test: 'error',
      // Base UI wraps focus-trapping popups (the Select listbox, etc.) in
      // focus-guard sentinels: `<span data-base-ui-focus-guard aria-hidden="true"
      // tabindex="0">`. axe flags these as `aria-hidden-focus` (serious), but the
      // aria-hidden + tabindex=0 combination is the intended focus-trap sentinel
      // pattern (same as Radix / Floating UI / React Aria) — the span only catches
      // Tab to wrap focus back into the popup, it never holds resting focus and is
      // never announced. Exclude just these vendor nodes from the scan (matched by
      // their Base-UI-specific attribute) so the rule keeps running on all real
      // content. Revisit if a future Base UI release makes the guards tabindex=-1.
      context: { exclude: [['[data-base-ui-focus-guard]']] },
    },
    // Belt-and-braces for Chromatic specifically: even with the loader
    // above, give the headless renderer a small extra window before the
    // pixel capture fires. Negligible on local Storybook.
    chromatic: {
      delay: 200,
    },
  },
  tags: ['autodocs'],
};

export default preview;

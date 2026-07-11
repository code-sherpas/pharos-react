import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

// Self-host the D8 font stack (Outfit + Inter) the way a real consumer must:
// Pharos ships NO fonts (D8/D9 — the published bundle carries no @font-face,
// no global typography). The `--pharos-font-family-*` tokens name Outfit/Inter
// but it's the consumer's job to load them; without this the whole app falls
// back to system-ui and never shows the design-system typography.
import '@fontsource/outfit/400.css';
import '@fontsource/outfit/500.css';
import '@fontsource/outfit/600.css';
import '@fontsource/outfit/700.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';

// The Pharos consumer contract, verbatim from AGENTS.md → "Consuming the
// package": token CSS variables first, then the component style bundle, both
// as one-off side-effect imports. If either export breaks, this app fails to
// start — which is exactly the regression we want the harness to catch.
import '@code-sherpas/pharos-tokens/css';
import '@code-sherpas/pharos-react/styles.css';

// Demo-only app-shell layout (page background, centering, form field spacing).
// NOT part of Pharos and never published — the equivalent of a consumer's own
// application CSS.
import './styles.css';

import { App } from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

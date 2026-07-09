import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

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

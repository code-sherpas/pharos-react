---
'@code-sherpas/pharos-react': major
---

Requires `@code-sherpas/pharos-tokens` `^1.3.0` (was `^1.2.0`): the side bar of a `warning` `Alert` uses `semantic.warning.border`, the amber that pharos-tokens 1.3.0 publishes for borders and bars, which clears WCAG 3:1 non-text contrast where `semantic.warning.fg` does not. Nothing else changes. Install pharos-tokens 1.3.0 alongside this release: `pnpm add @code-sherpas/pharos-react@^5 @code-sherpas/pharos-tokens@^1.3`.
